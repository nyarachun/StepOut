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
import type { City } from '../types/city';

type CityContextType = {
    cities: City[];
    selectedCity: City | null;
    setSelectedCity: (city: City) => void;
};

const CityContext = createContext<CityContextType | null>(null);

type CityProviderProps = {
    children: ReactNode;
};

export const CityProvider = ({ children }: CityProviderProps) => {
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCityState] = useState<City | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadCities = async () => {
            try {
                const response = await api.get<City[]>('/cities', {
                    signal: controller.signal,
                });
                const data = response.data;

                setCities(data);

                const savedCityId = localStorage.getItem('selectedCityId');
                const savedCity = data.find((city) => city.id === Number(savedCityId));

                const defaultCity =
                    savedCity || data.find((city) => city.name === 'Lviv') || data[0] || null;

                if (defaultCity) {
                    setSelectedCityState(defaultCity);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }
            }
        };

        void loadCities();

        return () => {
            controller.abort();
        };
    }, []);

    const setSelectedCity = useCallback((city: City) => {
        setSelectedCityState(city);
        localStorage.setItem('selectedCityId', String(city.id));
    }, []);

    const value = useMemo(
        () => ({
            cities,
            selectedCity,
            setSelectedCity,
        }),
        [cities, selectedCity, setSelectedCity],
    );

    return (
        <CityContext.Provider value={value}>
            {children}
        </CityContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCity = () => {
    const context = useContext(CityContext);

    if (!context) {
        throw new Error('useCity must be used inside CityProvider');
    }

    return context;
};