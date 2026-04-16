'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

const FLOOR_MAP: Record<string, string> = {
  '/':          'RDC \u2014 ACCUEIL',
  '/resultats': '\u00c9TAGE 1 \u2014 CLASSEMENT',
  '/jukebox':   '\u00c9TAGE 2 \u2014 SALLE D\u2019\u00c9COUTE',
  '/shopping':  '\u00c9TAGE 3 \u2014 BOUTIQUE',
  '/contact':   '\u00c9TAGE 4 \u2014 CONTACT',
};

const FLOOR_NUMBER: Record<string, string> = {
  '/':          'RDC',
  '/resultats': '1',
  '/jukebox':   '2',
  '/shopping':  '3',
  '/contact':   '4',
};

export type TransitionPhase = 'idle' | 'closing' | 'display' | 'opening' | 'done';

export function usePageTransition() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [floorLabel, setFloorLabel] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const bellRef = useRef<HTMLAudioElement | null>(null);

  // Preload bell sound
  useEffect(() => {
    if (typeof window === 'undefined') return;
    bellRef.current = new Audio('/game/audio/elevator-bell.mp3');
    bellRef.current.volume = 0.6;
    bellRef.current.preload = 'auto';
    bellRef.current.load();
  }, []);

  const playBell = useCallback(() => {
    try {
      if (!bellRef.current) return;
      const clone = bellRef.current.cloneNode() as HTMLAudioElement;
      clone.addEventListener('ended', () => clone.remove(), { once: true });
      clone.volume = 0.6;
      clone.play().catch(() => {});
    } catch {}
  }, []);

  // Trigger transition programmatically (called from ExcelNav before navigation)
  const triggerTransition = useCallback((targetPath: string) => {
    if (phase !== 'idle') return;
    const label = FLOOR_MAP[targetPath] || targetPath.toUpperCase();
    const num = FLOOR_NUMBER[targetPath] || '?';
    setFloorLabel(label);
    setFloorNumber(num);
    setPhase('closing');
  }, [phase]);

  // Advance phases with timers
  useEffect(() => {
    if (phase === 'idle') return;

    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case 'closing':
        timer = setTimeout(() => setPhase('display'), 300);
        break;
      case 'display':
        timer = setTimeout(() => {
          playBell();
          setPhase('opening');
        }, 400);
        break;
      case 'opening':
        timer = setTimeout(() => setPhase('done'), 300);
        break;
      case 'done':
        timer = setTimeout(() => setPhase('idle'), 200);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, playBell]);

  // Track pathname changes to detect external navigation (browser back/forward)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      // If no transition is running, trigger one for browser navigation
      if (phase === 'idle') {
        const label = FLOOR_MAP[pathname] || pathname.toUpperCase();
        const num = FLOOR_NUMBER[pathname] || '?';
        setFloorLabel(label);
        setFloorNumber(num);
        setPhase('closing');
      }
    }
  }, [pathname, phase]);

  const isTransitioning = phase !== 'idle';

  return {
    phase,
    isTransitioning,
    floorLabel,
    floorNumber,
    triggerTransition,
  };
}
