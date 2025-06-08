import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { broadcastMessageAsync, fetchChatMessages } from '../../slices/chatSlice';
import { AppDispatch, RootState } from '../../store/store';
import type { Message, ChatState } from '../../slices/chatSlice';
import { apiService } from '../../services/api';

interface ChatWithLastMessage {
  id: string;
  name: string;
  description: string;
  lastMessage?: Message;
}

export default function ChatList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [broadcastText, setBroadcastText] = useState("");
  const [chats, setChats] = useState<ChatWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [error, setError] = useState("");
  const chatState = useSelector((state: RootState) => state.chat as ChatState);

  // Fetch chats and their last messages when component mounts
  useEffect(() => {
    const fetchChatsAndMessages = async () => {
      setIsLoadingChats(true);
      try {
        // Fetch chat list
        const chatList = await apiService.getChats();
        
        // Fetch last message for each chat
        const chatsWithMessages = await Promise.all(
          chatList.map(async (chat) => {
            try {
              const messages = await apiService.getChatMessages(chat.id);
              return {
                ...chat,
                lastMessage: messages[messages.length - 1],
              };
            } catch (err) {
              console.error(`Failed to fetch messages for chat ${chat.id}:`, err);
              return {
                ...chat,
                lastMessage: undefined,
              };
            }
          })
        );

        setChats(chatsWithMessages);
      } catch (err) {
        setError("Failed to fetch chat list");
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchChatsAndMessages();
  }, []);

  // Update last messages when chat state changes
  useEffect(() => {
    setChats(prevChats => 
      prevChats.map(chat => ({
        ...chat,
        lastMessage: chatState[chat.id]?.[chatState[chat.id].length - 1],
      }))
    );
  }, [chatState]);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;

    try {
      await dispatch(broadcastMessageAsync({
        chatIds: chats.map(chat => chat.id),
        message: {
          sender: "System",
          text: broadcastText,
          timestamp: new Date().toISOString(),
        }
      })).unwrap();
      setBroadcastText("");
    } catch (err) {
      setError("Failed to broadcast message. Please try again.");
    }
  };

  // Loading skeleton for chat items
  const ChatSkeleton = () => (
    <ListItem disablePadding>
      <ListItemButton sx={{ py: 2 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" />}
          secondary={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Broadcast Message
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type a message to broadcast..."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              disabled={isLoading || isLoadingChats}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBroadcast();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleBroadcast}
              disabled={!broadcastText.trim() || isLoading || isLoadingChats}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isLoading ? 'Broadcasting...' : 'Broadcast'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ flex: 1, overflow: 'hidden' }}>
        {isLoadingChats ? (
          <List sx={{ height: '100%', overflow: 'auto' }}>
            {[1, 2, 3].map((index) => (
              <React.Fragment key={index}>
                {index > 1 && <Divider />}
                <ChatSkeleton />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <List sx={{ height: '100%', overflow: 'auto' }}>
            {chats.map((chat, index) => (
              <React.Fragment key={chat.id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleChatClick(chat.id)}
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <ChatIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="div">
                          {chat.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {chat.description}
                          </Typography>
                          {chat.lastMessage && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                  fontWeight: 500,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                {chat.lastMessage.sender}:
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {chat.lastMessage.text}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 'auto' }}
                              >
                                {new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
} 