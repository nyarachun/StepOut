import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

export type ChatParticipant = {
  id: number;
  user: {
    id: number;
    name: string;
  };
};

export type Chat = {
  id: number;
  type: 'event' | 'admin';
  event: {
    id: number;
    title: string;
  } | null;
  participants: ChatParticipant[];
  createdAt: string;
};

export type Message = {
  id: number;
  text: string;
  isSystem: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
  } | null;
};

export const getMyChats = async (config?: AxiosRequestConfig) => {
  const response = await api.get<Chat[]>('/chats', config);
  return response.data;
};

export const getUnreadCount = async (config?: AxiosRequestConfig) => {
  const response = await api.get<number>('/chats/unread', config);
  return response.data;
};

export const markChatAsRead = async (chatId: number, config?: AxiosRequestConfig) => {
  const response = await api.post<{ unreadCount: number }>(`/chats/${chatId}/read`, {}, config);
  return response.data;
};

export const getChatMessages = async (chatId: number, config?: AxiosRequestConfig) => {
  const response = await api.get<Message[]>(`/chats/${chatId}/messages`, config);
  return response.data;
};

export const sendMessage = async (chatId: number, text: string, config?: AxiosRequestConfig) => {
  const response = await api.post<Message>(
    `/chats/${chatId}/messages`,
    { text },
    config,
  );
  return response.data;
};

export const createEventChat = async (eventId: number, message: string, config?: AxiosRequestConfig) => {
  const response = await api.post<Chat>(
    '/chats/events',
    { eventId, message },
    config,
  );
  return response.data;
};