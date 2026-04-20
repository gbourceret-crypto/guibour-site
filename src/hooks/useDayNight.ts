'use client';

import { useEffect, useState } from 'react';

export type TimeMode = 'day' | 'night';

function getMode(): TimeMode {
  const h = new Date().getHours();
  // Jour: 6h-18h / Nuit: 18h-6h
  return h >= 6 && h < 18 ? 'day' : 'night';
}

/**
 * Returns the current time mode ('day' | 'night') based on local clock.
 * Re-evaluates at the top of every hour (or on mount).
 */
export function useDayNight(): TimeMode {
  // Default to 'day' to avoid dark flash on SSR/hydration
  const [mode, setMode] = useState<TimeMode>('day');

  useEffect(() => {
    setMode(getMode());

    // Schedule recalculation at next hour boundary
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setMode(getMode());
      // Then re-check every hour
      const interval = setInterval(() => setMode(getMode()), 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msToNextHour);

    return () => clearTimeout(timeout);
  }, []);

  return mode;
}

export interface DayNightTheme {
  bg: string;
  bg2: string;
  gridOpacity: number;
  neonGlow: 'strong' | 'subtle';
  accentLabel: string;
  navBg: string;
  navBorder: string;
  gridColor: string;
  neonTextShadow: string;
  chromeBg: string;
}

/**
 * Bloc-note style: papier le jour, encre la nuit.
 * Jour : fond papier #F5F0E8, texte noir #1A1A1A
 * Nuit : fond noir #1A1A1A, texte papier #F5F0E8
 */
export function getDayNightTheme(mode: TimeMode): DayNightTheme {
  if (mode === 'day') {
    return {
      bg: '#F5F0E8',
      bg2: '#EDE8DF',
      gridOpacity: 0.12,
      neonGlow: 'subtle',
      accentLabel: 'MODE JOUR',
      navBg: '#F5F0E8',
      navBorder: '#D4CFC4',
      gridColor: 'rgba(0,0,0,.06)',
      neonTextShadow: 'none',
      chromeBg: '#F5F0E8',
    };
  }
  return {
    bg: '#1A1A1A',
    bg2: '#111111',
    gridOpacity: 0.08,
    neonGlow: 'strong',
    accentLabel: 'MODE NUIT',
    navBg: '#1A1A1A',
    navBorder: '#333333',
    gridColor: 'rgba(255,255,255,.04)',
    neonTextShadow: 'none',
    chromeBg: '#1A1A1A',
  };
}
