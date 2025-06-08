import React, { useState } from "react";
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
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { broadcastMessage } from '../../slices/chatSlice';
import { RootState } from '../../store/store';
import type { Message, ChatState } from '../../slices/chatSlice';

// Simulated chat list (in a real app, you'd fetch this from an API or a store)
const chats = [
  { id: "1", name: "General Chat", description: "Main chat room for everyone" },
  { id: "2", name: "Support", description: "Get help from our team" },
  { id: "3", name: "Announcements", description: "Important updates and news" },
];

export default function ChatList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [broadcastText, setBroadcastText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState("");
  const chatState = useSelector((state: RootState) => state.chat as ChatState);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;

    setIsBroadcasting(true);
    setError("");

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch(broadcastMessage({
        chatIds: chats.map(chat => chat.id),
        message: {
          sender: "System",
          text: broadcastText,
          timestamp: new Date().toISOString(),
        }
      }));
      setBroadcastText("");
    } catch (err) {
      setError("Failed to broadcast message. Please try again.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Get the last message for a specific chat
  const getLastMessage = (chatId: string): Message | undefined => {
    const chatMessages = chatState[chatId] || [];
    return chatMessages[chatMessages.length - 1];
  };

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
              disabled={isBroadcasting}
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
              disabled={!broadcastText.trim() || isBroadcasting}
              startIcon={isBroadcasting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isBroadcasting ? 'Broadcasting...' : 'Broadcast'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ flex: 1, overflow: 'hidden' }}>
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
      </Paper>
    </Box>
  );
} 