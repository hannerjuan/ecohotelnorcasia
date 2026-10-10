import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';
import type { HotelSettings } from '../types';

const DEFAULTS: HotelSettings = {
  hotelName: 'EcoHotel Madeguadua',
  whatsappNumber: '573044527620',
  email: 'ecohotelmadeguadua@gmail.com',
  address: 'Vereda La Miel, Norcasia, Caldas',
  latitude: 5.5786,
  longitude: -74.8943,
  heroImages: [],
};

const SettingsContext = createContext<{ settings: HotelSettings; setSettings: (s: HotelSettings) => void }>({
  settings: DEFAULTS,
  setSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULTS);
  useEffect(() => {
    api.get<HotelSettings>('/settings').then(setSettings).catch(() => {});
  }, []);
  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);

export function whatsappUrl(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
