'use client';

import { useEffect, useState } from 'react';

// Cible : 1er juin 2026, 18h00 heure de Paris (UTC+2 en été)
const TARGET = new Date('2026-06-01T18:00:00+02:00').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = TARGET - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Countdown() {
  const [t, setT] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setT(computeTimeLeft());
    const id = setInterval(() => setT(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!t) return null; // avoid hydration mismatch
  if (t.expired) return null;

  const isUrgent = t.days < 7;

  return (
    <div style={{
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Label */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '9px',
        color: isUrgent ? '#FF6666' : '#FF4444',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        animation: isUrgent ? 'blink 1s step-start infinite' : undefined,
      }}>
        ⚠ CONCOURS W.O.W — FIN DES INSCRIPTIONS DANS
      </div>

      {/* Digits */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: "'Luckiest Guy', cursive",
      }}>
        {/* Days */}
        <div style={digitStyle(isUrgent)}>
          <span style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: isUrgent ? '#FF6666' : '#FF4444', lineHeight: 1 }}>
            {pad(t.days)}
          </span>
          <span style={labelStyle}>JOURS</span>
        </div>

        <span style={sepStyle}>:</span>

        {/* Hours */}
        <div style={digitStyle(isUrgent)}>
          <span style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: isUrgent ? '#FF6666' : '#FF4444', lineHeight: 1 }}>
            {pad(t.hours)}
          </span>
          <span style={labelStyle}>H</span>
        </div>

        <span style={sepStyle}>:</span>

        {/* Minutes */}
        <div style={digitStyle(isUrgent)}>
          <span style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: isUrgent ? '#FF6666' : '#FF4444', lineHeight: 1 }}>
            {pad(t.minutes)}
          </span>
          <span style={labelStyle}>MIN</span>
        </div>

        <span style={sepStyle}>:</span>

        {/* Seconds */}
        <div style={digitStyle(isUrgent)}>
          <span style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: isUrgent ? '#FF8888' : '#FF6666', lineHeight: 1 }}>
            {pad(t.seconds)}
          </span>
          <span style={labelStyle}>SEC</span>
        </div>
      </div>

      {/* Sub-label */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '8px',
        color: '#3C5A7A',
        letterSpacing: '2px',
      }}>
        01 JUIN 2026 — 18H00 — RÉSULTATS LIVE
      </div>
    </div>
  );
}

const digitStyle = (urgent: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: urgent ? 'rgba(80,0,0,.35)' : 'rgba(60,0,0,.25)',
  border: `1px solid ${urgent ? 'rgba(255,80,80,.45)' : 'rgba(255,68,68,.3)'}`,
  borderRadius: '4px',
  padding: '6px 10px',
  minWidth: 'clamp(52px, 8vw, 70px)',
  boxShadow: urgent ? '0 0 10px rgba(255,60,60,.2)' : 'none',
});

const labelStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '7px',
  color: '#FF4444',
  letterSpacing: '2px',
  marginTop: '2px',
  opacity: 0.7,
};

const sepStyle: React.CSSProperties = {
  fontSize: 'clamp(22px, 4vw, 32px)',
  color: '#FF4444',
  lineHeight: 1,
  marginBottom: '12px',
  opacity: 0.6,
};
