import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export type ChatContextValue = {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    socket: Socket | null;
};

export const ChatContext = createContext<ChatContextValue | null>(null);