'use client';

import { GameState } from '@/lib/gameTypes';
import { addScore, formatDuration, formatSalary, getRank, getShareText } from '@/lib/leaderboard';
import { useEffect, useState } from 'react';

interface Props {
  state: GameState;
  onRestart: () => void;
}

export default function GameOverScreen({ state, onRestart }: Props) {
  const { player, level, status } = state;
  const isVictory = status === 'victory';
  const [rank, setRank] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const durationMs = state.endTime && state.startTime ? state.endTime - state.startTime : 0;
  const durationText = formatDuration(durationMs);

  useEffect(() => {
    if (!saved) {
      const r = addScore({
        name: player.name,
        score: player.score,
        level,
        date: new Date().toISOString(),
      });
      setRank(r);
      setSaved(true);
    }
  }, [saved, player, level]);

  const handleShare = async () => {
    const text = getShareText(player.name, level, player.score, durationMs);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChallenge = async () => {
    const text = getShareText(player.name, level, player.score, durationMs);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guibureaucracy - Defi',
          text,
          url: 'https://guibour.fr',
        });
      } catch {}
    } else {
      const challengeText = `${text}\n\nguibour.fr`;
      await navigator.clipboard.writeText(challengeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
         style={{ background: 'rgba(10,26,18,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-[440px] max-w-[92vw] overflow-hidden shadow-2xl"
           style={{
             animation: 'slideUp 0.4s ease-out',
             border: '2px solid #1A5C38',
             background: '#fff',
           }}>
        {/* Excel-style title bar — always green corporate */}
        <div className="flex items-center justify-between px-3 py-2"
             style={{ background: '#1A5C38' }}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FF5F56' }} />
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#27C93F' }} />
            </div>
            <span style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '1px',
            }}>
              {isVictory ? 'GUIBOUR CORP. — PROMOTION' : 'GUIBOUR CORP. — FIN DE CONTRAT'}
            </span>
          </div>
          {/* Window controls right side */}
          <div className="flex gap-2 text-white/60" style={{ fontSize: '10px' }}>
            <span>—</span><span>□</span><span>✕</span>
          </div>
        </div>

        {/* Excel formula bar */}
        <div className="flex items-center border-b" style={{ borderColor: '#C0D0DE', background: '#FAFAFA' }}>
          <div className="flex items-center justify-center border-r px-2 py-1" style={{ borderColor: '#C0D0DE', background: '#E8E8E8' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#777' }}>fx</span>
          </div>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: '#1A5C38',
            padding: '4px 8px',
          }}>
            =BILAN(&quot;{player.name}&quot;, DUREE({durationText}), SALAIRE({formatSalary(player.score)}))
          </span>
        </div>

        {/* Body — Excel cell grid style */}
        <div className="p-5 text-center" style={{ background: '#F5F5F5' }}>
          <h2 style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: '22px',
            fontWeight: 800,
            color: '#0A1A12',
            marginBottom: '4px',
            letterSpacing: '1px',
          }}>
            {isVictory ? 'PROMOTION ACCORDEE' : 'FIN DE CONTRAT'}
          </h2>
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            color: '#607888',
            marginBottom: '12px',
          }}>
            {isVictory
              ? `${player.name}, vous etes promu(e) PDG de Guibour Corp.`
              : `${player.name}, votre CDD n'a pas ete renouvele.`}
          </p>

          {/* Duration — prominent */}
          <div style={{
            background: '#fff',
            border: '1px solid #C8D8E8',
            padding: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#607888' }}>
              DUREE DANS LE SYSTEME
            </span>
            <div style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: '32px',
              fontWeight: 800,
              color: '#1A5C38',
              lineHeight: 1.2,
            }}>
              {durationText}
            </div>
          </div>

          {/* Stats — Excel cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1px',
            background: '#C8D8E8',
            border: '1px solid #C8D8E8',
            marginBottom: '12px',
          }}>
            {[
              { label: 'NIVEAU', value: String(level), color: '#0A1A12' },
              { label: 'SALAIRE', value: formatSalary(player.score), color: '#1A5C38' },
              { label: 'CLASSEMENT', value: `#${rank}`, color: '#D4A020' },
            ].map(cell => (
              <div key={cell.label} style={{ background: '#fff', padding: '8px 6px', textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px',
                  color: '#607888',
                  letterSpacing: '2px',
                  marginBottom: '2px',
                }}>{cell.label}</div>
                <div style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: cell.color,
                }}>{cell.value}</div>
              </div>
            ))}
          </div>

          {/* Challenge */}
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: '#1A5C38',
            letterSpacing: '2px',
            marginBottom: '14px',
          }}>
            PEUX-TU BATTRE MON SCORE ?
          </p>

          {/* Buttons — corporate style */}
          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="flex-1 cursor-pointer py-3 text-xs font-bold tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                fontFamily: "'Oxanium', sans-serif",
                background: '#1A5C38',
                border: '1px solid #0A1A12',
              }}
            >
              REJOUER
            </button>
            <button
              onClick={handleChallenge}
              className="flex-1 cursor-pointer py-3 text-xs font-bold tracking-widest transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                fontFamily: "'Oxanium', sans-serif",
                background: '#2E8B57',
                color: '#fff',
                border: '1px solid #1A5C38',
              }}
            >
              {copied ? 'COPIE !' : 'DEFIER UN AMI'}
            </button>
            <button
              onClick={handleShare}
              className="cursor-pointer px-4 py-3 text-xs font-bold tracking-widest transition-all hover:bg-[#E8E8E8] active:scale-[0.98]"
              style={{
                fontFamily: "'Oxanium', sans-serif",
                background: '#fff',
                color: '#0A1A12',
                border: '1px solid #C8D8E8',
              }}
            >
              PARTAGER
            </button>
          </div>
        </div>

        {/* Bottom status bar — Excel style */}
        <div className="flex items-center justify-between px-3 py-1"
             style={{ background: '#1A5C38', borderTop: '1px solid #0F3320' }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>
            guibour.fr
          </span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>
            #guibureaucracy
          </span>
        </div>
      </div>
    </div>
  );
}
