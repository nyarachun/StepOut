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

export type UserRole = 'user' | 'organizer' | 'admin';

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
    // login більше не приймає токен, ми просто рефрешимо юзера після успішного запиту
    login: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Зі старту ми не знаємо, чи залогінений юзер, тому ставимо isLoading = true
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async (signal?: AbortSignal) => {
        try {
            // Браузер сам підставить HttpOnly куку завдяки withCredentials: true
            const response = await api.get<CurrentUser>('/users/me', { signal });
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            if (axios.isCancel(error)) return;
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const initAuth = async () => {
            await fetchUser(controller.signal);
        };

        initAuth();

        return () => {
            controller.abort();
        };
    }, [fetchUser]);

    const login = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            // Кажемо беку знести куку
            await api.post('/auth/logout');
        } finally {
            // Чистимо стейт незалежно від результату запиту
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated,
            user,
            isLoading,
            login,
            logout,
        }),
        [isAuthenticated, user, isLoading, login, logout],
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
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
};