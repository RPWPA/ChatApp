import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services/api';

export interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface ChatState {
  [chatId: string]: Message[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchChatMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId: string) => {
    const messages = await apiService.getChatMessages(chatId);
    return { chatId, messages };
  }
);

export const sendMessageAsync = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, message }: { chatId: string; message: Omit<Message, 'id'> }) => {
    const newMessage = await apiService.sendMessage(chatId, message);
    return { chatId, message: newMessage };
  }
);

export const broadcastMessageAsync = createAsyncThunk(
  'chat/broadcastMessage',
  async ({ chatIds, message }: { chatIds: string[]; message: Omit<Message, 'id'> }) => {
    await apiService.broadcastMessage(chatIds, message);
    return { chatIds, message };
  }
);

const initialState: ChatState = {
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state[chatId] = messages;
        state.loading = false;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      
      // Send message
      .addCase(sendMessageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        if (!state[chatId]) state[chatId] = [];
        state[chatId].push(message);
        state.loading = false;
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      
      // Broadcast message
      .addCase(broadcastMessageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(broadcastMessageAsync.fulfilled, (state, action) => {
        const { chatIds, message } = action.payload;
        chatIds.forEach(chatId => {
          if (!state[chatId]) state[chatId] = [];
          state[chatId].push({ ...message, id: state[chatId].length + 1 });
        });
        state.loading = false;
      })
      .addCase(broadcastMessageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to broadcast message';
      });
  },
});

export const { clearError } = chatSlice.actions;
export default chatSlice.reducer; 