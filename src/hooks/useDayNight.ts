'use client';

import { useEffect, useState } from 'react';

export type TimeMode = 'day' | 'night';

function getMode(): TimeMode {
  const h = new Date().getHours();
  // Jour: 8h–19h / Nuit: reste
  return h >= 8 && h < 19 ? 'day' : 'night';
}

/**
 * Returns the current time mode ('day' | 'night') based on local clock.
 * Re-evaluates at the top of every hour (or on mount).
 */
export function useDayNight(): TimeMode {
  const [mode, setMode] = useState<TimeMode>('night');

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

/**
 * Returns CSS variables / theme values for the current mode.
 * Day mode: slightly lighter, more vibrant "work hours" feel
 * Night mode: current dark navy (default)
 */
export function getDayNightTheme(mode: TimeMode) {
  if (mode === 'day') {
    return {
      bg: '#1E4A8C',          // légèrement plus clair le jour
      bg2: '#122E68',
      gridOpacity: 0.22,
      accentLabel: '☀ MODE JOURNÉE',
      navBg: '#0E3068',
      navBorder: '#224A8C',
    };
  }
  return {
    bg: '#1A3F78',            // nuit — couleurs habituelles
    bg2: '#0C2A62',
    gridOpacity: 0.16,
    accentLabel: '🌙 MODE NUIT',
    navBg: '#0D2B5E',
    navBorder: '#1B3A6B',
  };
}
