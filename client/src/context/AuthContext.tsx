import axios from 'axios';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import { api } from '../api/api';

export type UserRole =
    | 'user'
    | 'organizer'
    | 'admin';

export type CurrentUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
};

type AuthContextType = {
    isAuthenticated: boolean;
    user: CurrentUser | null;
    isLoading: boolean;
    login: (
        token: string,
        rememberMe: boolean,
    ) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextType | null>(
        null,
    );

type AuthProviderProps = {
    children: ReactNode;
};

const getStoredToken = () => {
    return (
        localStorage.getItem(
            'accessToken',
        ) ||
        sessionStorage.getItem(
            'accessToken',
        )
    );
};

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] =
        useState(() =>
            Boolean(getStoredToken()),
        );

    const [user, setUser] =
        useState<CurrentUser | null>(
            null,
        );

    const [isLoading, setIsLoading] =
        useState(() =>
            Boolean(getStoredToken()),
        );

    const refreshUser = useCallback(async (signal?: AbortSignal) => {
        const token = getStoredToken();

        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get<CurrentUser>('/users/me', {
                signal,
            });

            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            }

            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');

            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = getStoredToken();

        if (!token) {
            return;
        }

        const controller = new AbortController();

        const loadInitialUser = async () => {
            try {
                const response = await api.get<CurrentUser>('/users/me', {
                    signal: controller.signal,
                });

                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }

                localStorage.removeItem('accessToken');
                sessionStorage.removeItem('accessToken');

                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        void loadInitialUser();

        return () => {
            controller.abort();
        };
    }, []);

    const login = useCallback(
        (token: string, rememberMe: boolean) => {
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');

            const storage = rememberMe
                ? localStorage
                : sessionStorage;

            storage.setItem('accessToken', token);

            setIsAuthenticated(true);
            void refreshUser();
        },
        [refreshUser],
    );

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');

        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated,
            user,
            isLoading,
            login,
            logout,
            refreshUser: () => refreshUser(),
        }),
        [isAuthenticated, user, isLoading, login, logout, refreshUser],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider',
        );
    }

    return context;
};