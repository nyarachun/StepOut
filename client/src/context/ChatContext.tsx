import axios from 'axios';
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';

import { API_URL } from '../api/api';
import { getUnreadCount } from '../api/chats';
import { useAuth } from './AuthContext';
import { ChatContext } from './ChatContextValue';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(null);

    const refreshUnreadCount = useCallback(async (signal?: AbortSignal) => {
        if (!isAuthenticated) {
            setUnreadCount(0);
            return;
        }

        try {
            const count = await getUnreadCount(signal ? { signal } : undefined);
            setUnreadCount(count);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            }
            setUnreadCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const controller = new AbortController();

        const fetchInitialUnread = async () => {
            try {
                const count = await getUnreadCount({ signal: controller.signal });
                setUnreadCount(count);
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }
                setUnreadCount(0);
            }
        };

        void fetchInitialUnread();

        return () => {
            controller.abort();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        const client = io(API_URL, {
            withCredentials: true,
            query: { userId: String(user.id) },
        });

        client.on('connect', () => {
            setSocket(client);
        });

        client.on('unreadCount', (count: number) => {
            setUnreadCount(count);
        });

        client.on('newMessage', () => {
            void refreshUnreadCount();
        });

        return () => {
            client.off('connect');
            client.off('unreadCount');
            client.off('newMessage');
            client.disconnect();
            setSocket(null);
        };
    }, [isAuthenticated, refreshUnreadCount, user?.id]);

    const activeUnreadCount = isAuthenticated ? unreadCount : 0;
    const activeSocket = isAuthenticated && user?.id ? socket : null;

    const value = useMemo(
        () => ({
            unreadCount: activeUnreadCount,
            refreshUnreadCount: () => refreshUnreadCount(),
            socket: activeSocket,
        }),
        [activeUnreadCount, refreshUnreadCount, activeSocket],
    );

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};