import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

export type Registration = {
  id: number;
  event: {
    id: number;
    title: string;
    description: string;
    date: string;
    address: string;
    price: number;
    capacity: number;
    imageUrl: string | null;
  };
  createdAt: string;
};

export const registerForEvent = async (eventId: number, config?: AxiosRequestConfig) => {
  const response = await api.post<Registration>('/registrations', { eventId }, config);
  return response.data;
};

export const getMyRegistrations = async (config?: AxiosRequestConfig) => {
  const response = await api.get<Registration[]>('/registrations/my', config);
  return response.data;
};

export const getMyRegistration = async (eventId: number, config?: AxiosRequestConfig) => {
  const response = await api.get<Registration>(`/registrations/event/${eventId}`, config);
  return response.data;
};

export const cancelRegistration = async (registrationId: number, config?: AxiosRequestConfig) => {
  await api.delete(`/registrations/${registrationId}`, config);
};