import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Message } from '../slices/chatSlice';

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create mock adapter
export const mock = new MockAdapter(api, { delayResponse: 500 });

// Types
export interface Chat {
  id: string;
  name: string;
  description: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Mock API endpoints
mock.onPost('/auth/login').reply((config) => {
  const { email, password } = JSON.parse(config.data) as LoginCredentials;
  
  if (email === 'test@chat.com' && password === '123456') {
    return [200, {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@chat.com',
        name: 'Test User'
      }
    }];
  }
  
  return [401, { message: 'Invalid credentials' }];
});

// Mock chat endpoints
mock.onGet('/chats').reply(200, [
  { id: "1", name: "General Chat", description: "Main chat room for everyone" },
  { id: "2", name: "Support", description: "Get help from our team" },
  { id: "3", name: "Announcements", description: "Important updates and news" },
]);

mock.onGet(/\/chats\/\d+\/messages/).reply((config) => {
  const chatId = config.url?.split('/')[2];
  const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
  return [200, messages];
});

mock.onPost(/\/chats\/\d+\/messages/).reply((config) => {
  const chatId = config.url?.split('/')[2];
  const message = JSON.parse(config.data);
  const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
  
  const newMessage = {
    ...message,
    id: messages.length + 1,
    timestamp: new Date().toISOString(),
  };
  
  messages.push(newMessage);
  localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
  
  return [201, newMessage];
});

mock.onPost('/broadcast').reply((config) => {
  const { chatIds, message } = JSON.parse(config.data);
  
  chatIds.forEach((chatId: string) => {
    const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    const newMessage = {
      ...message,
      id: messages.length + 1,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
  });
  
  return [201, { success: true }];
});

// API service functions
export const apiService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  
  getChats: async () => {
    const response = await api.get<Chat[]>('/chats');
    return response.data;
  },
  
  getChatMessages: async (chatId: string) => {
    const response = await api.get<Message[]>(`/chats/${chatId}/messages`);
    return response.data;
  },
  
  sendMessage: async (chatId: string, message: Omit<Message, 'id'>) => {
    const response = await api.post<Message>(`/chats/${chatId}/messages`, message);
    return response.data;
  },
  
  broadcastMessage: async (chatIds: string[], message: Omit<Message, 'id'>) => {
    const response = await api.post('/broadcast', { chatIds, message });
    return response.data;
  },
}; 