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
import { broadcastMessageAsync } from '../../slices/chatSlice';
import { AppDispatch, RootState } from '../../store/store';
import type { Message, ChatState } from '../../slices/chatSlice';
import { apiService } from '../../services/api';

export default function ChatList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [broadcastText, setBroadcastText] = useState("");
  const [chats, setChats] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const chatState = useSelector((state: RootState) => state.chat as ChatState);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Fetch chats when component mounts
  useEffect(() => {
    const fetchChats = async () => {
      setIsLoadingChats(true);
      try {
        const chatList = await apiService.getChats();
        setChats(chatList);
      } catch (err) {
        setError("Failed to fetch chat list");
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

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

  // Get the last message for a specific chat
  const getLastMessage = (chatId: string): Message | undefined => {
    const chatMessages = chatState[chatId] || [];
    return chatMessages[chatMessages.length - 1];
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
            {chats.map((chat, index) => {
              const lastMessage = getLastMessage(chat.id);
              return (
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
                            {lastMessage && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                  sx={{
                                    fontWeight: 500,
                                    color: theme.palette.primary.main,
                                  }}
                                >
                                  {lastMessage.sender}:
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
                                  {lastMessage.text}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: 'auto' }}
                                >
                                  {new Date(lastMessage.timestamp).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
} 