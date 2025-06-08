import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Avatar,
  CircularProgress,
  Divider,
  useTheme,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import type { Message, ChatState } from '../../slices/chatSlice';
import { sendMessageAsync, fetchChatMessages } from '../../slices/chatSlice';

function getChatbotResponse(userMessage: string): string {
  // Simple canned/logic-based responses
  if (userMessage.toLowerCase().includes("hello")) return "Hello! How can I help you today?";
  if (userMessage.toLowerCase().includes("help")) return "Sure, I am here to assist you. What do you need help with?";
  if (userMessage.toLowerCase().includes("bye")) return "Goodbye! Have a great day!";
  return "I'm a chatbot. I can answer simple questions!";
}

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const messages = useSelector((state: RootState) => (state.chat as ChatState)[chatId || ''] || []);
  const loading = useSelector((state: RootState) => (state.chat as ChatState).loading);
  const error = useSelector((state: RootState) => (state.chat as ChatState).error);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages when component mounts
  useEffect(() => {
    if (chatId) {
      dispatch(fetchChatMessages(chatId));
    }
  }, [chatId, dispatch]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Simulate upload
  const simulateUpload = (callback: () => void) => {
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(null);
        callback();
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() === "") && !selectedFile) return;

    const userText = newMessage;
    setNewMessage("");

    let messagePayload = {
      sender: "You",
      text: userText,
      timestamp: new Date().toISOString(),
      mediaUrl: selectedFile ? (previewUrl || undefined) : undefined,
      mediaType: selectedFile ? (selectedFile.type.startsWith("image") ? "image" : selectedFile.type.startsWith("video") ? "video" : undefined) : undefined as 'image' | 'video' | undefined,
    };

    if (selectedFile) {
      simulateUpload(() => {
        dispatch(sendMessageAsync({ chatId: chatId || '', message: messagePayload }));
        setSelectedFile(null);
        setPreviewUrl(null);
        
        // Simulate chatbot response
        setTimeout(() => {
          dispatch(sendMessageAsync({ 
            chatId: chatId || '', 
            message: {
              sender: "Chatbot",
              text: getChatbotResponse(userText),
              timestamp: new Date().toISOString(),
            }
          }));
        }, 1200);
      });
    } else {
      dispatch(sendMessageAsync({ chatId: chatId || '', message: messagePayload }));
      
      // Simulate chatbot response
      setTimeout(() => {
        dispatch(sendMessageAsync({ 
          chatId: chatId || '', 
          message: {
            sender: "Chatbot",
            text: getChatbotResponse(userText),
            timestamp: new Date().toISOString(),
          }
        }));
      }, 1200);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={() => navigate("/chat")} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Chat Room {chatId}</Typography>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((msg: Message) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start',
              gap: 1,
            }}
          >
            {msg.sender !== 'You' && (
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {msg.sender === 'Chatbot' ? '🤖' : msg.sender[0]}
              </Avatar>
            )}
            <Box
              sx={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: msg.sender === 'You'
                    ? theme.palette.primary.main
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  color: msg.sender === 'You'
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                }}
              >
                {msg.text && (
                  <Typography variant="body1">{msg.text}</Typography>
                )}
                {msg.mediaUrl && msg.mediaType === "image" && (
                  <Card sx={{ mt: 1, maxWidth: 300 }}>
                    <CardMedia
                      component="img"
                      image={msg.mediaUrl}
                      alt="attachment"
                      sx={{ maxHeight: 200, objectFit: 'contain' }}
                    />
                  </Card>
                )}
                {msg.mediaUrl && msg.mediaType === "video" && (
                  <Card sx={{ mt: 1, maxWidth: 300 }}>
                    <CardMedia
                      component="video"
                      src={msg.mediaUrl}
                      controls
                      sx={{ maxHeight: 200 }}
                    />
                  </Card>
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start' }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
            {msg.sender === 'You' && (
              <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                Y
              </Avatar>
            )}
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* File Preview */}
      {previewUrl && (
        <Card sx={{ mx: 2, mb: 2, position: 'relative' }}>
          <IconButton
            size="small"
            onClick={handleRemoveFile}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedFile?.type.startsWith("image") ? (
            <CardMedia
              component="img"
              image={previewUrl}
              alt="preview"
              sx={{ height: 100, objectFit: 'contain' }}
            />
          ) : selectedFile?.type.startsWith("video") ? (
            <CardMedia
              component="video"
              src={previewUrl}
              controls
              sx={{ height: 100 }}
            />
          ) : null}
          <CardContent sx={{ py: 1 }}>
            <Typography variant="body2" noWrap>
              {selectedFile?.name}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <Box sx={{ mx: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading: {uploadProgress}%
          </Typography>
          <CircularProgress variant="determinate" value={uploadProgress} size={20} />
        </Box>
      )}

      {/* Message Input */}
      <Paper
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          display: 'flex',
          gap: 1,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Tooltip title="Attach file">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress !== null}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={uploadProgress !== null}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          multiline
          maxRows={4}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={(!newMessage.trim() && !selectedFile) || uploadProgress !== null}
          endIcon={uploadProgress !== null ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          {uploadProgress !== null ? 'Sending...' : 'Send'}
        </Button>
      </Paper>
    </Box>
  );
} 