import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: ChatState = {
  '1': [
    { id: 1, sender: 'User A', text: 'Hello, how are you?', timestamp: new Date(2023, 0, 1, 10, 0).toISOString() },
    { id: 2, sender: 'You', text: "I'm fine, thanks!", timestamp: new Date(2023, 0, 1, 10, 1).toISOString() },
    { id: 3, sender: 'User A', text: 'See you later.', timestamp: new Date(2023, 0, 1, 10, 2).toISOString() },
  ],
  '2': [
    { id: 1, sender: 'User B', text: 'Hey!', timestamp: new Date(2023, 0, 1, 11, 0).toISOString() },
    { id: 2, sender: 'You', text: 'Hi!', timestamp: new Date(2023, 0, 1, 11, 1).toISOString() },
    { id: 3, sender: 'User B', text: 'See you soon.', timestamp: new Date(2023, 0, 1, 11, 2).toISOString() },
  ],
  '3': [
    { id: 1, sender: 'Chatbot', text: 'How can I assist you?', timestamp: new Date(2023, 0, 1, 12, 0).toISOString() },
  ],
};

interface SendMessagePayload {
  chatId: string;
  message: Omit<Message, 'id'>;
}

interface BroadcastPayload {
  chatIds: string[];
  message: Omit<Message, 'id'>;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    sendMessage: (state, action: PayloadAction<SendMessagePayload>) => {
      const { chatId, message } = action.payload;
      const nextId = (state[chatId]?.length || 0) + 1;
      if (!state[chatId]) state[chatId] = [];
      state[chatId].push({ ...message, id: nextId });
    },
    broadcastMessage: (state, action: PayloadAction<BroadcastPayload>) => {
      const { chatIds, message } = action.payload;
      chatIds.forEach(chatId => {
        const nextId = (state[chatId]?.length || 0) + 1;
        if (!state[chatId]) state[chatId] = [];
        state[chatId].push({ ...message, id: nextId });
      });
    },
  },
});

export const { sendMessage, broadcastMessage } = chatSlice.actions;
export default chatSlice.reducer; 