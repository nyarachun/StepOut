import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  bio: string | null;
  interests: string[];
};

export const getMyProfile = async (config?: AxiosRequestConfig) => {
  const response = await api.get<UserProfile>('/users/me', config);
  return response.data;
};

export const updateMyProfile = async (
  id: number,
  data: {
    name: string;
    email: string;
    bio: string;
    interests: string[];
  },
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch<UserProfile>(`/users/${id}`, data, config);
  return response.data;
};

export const changeMyPassword = async (
  id: number,
  data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch(`/users/${id}/password`, data, config);
  return response.data;
};