'use client';

import { GameAssets } from '@/lib/assetLoader';

interface Props {
  currentLevel: number;
  totalLevels: number;
  assets: GameAssets | null;
  isAdMode?: boolean;
}

// Ad content cycles — placeholder promos / leaderboard callout
const AD_SLIDES = [
  {
    bg: 'linear-gradient(180deg, #0A0A1A 0%, #0D1D3A 100%)',
    accent: '#00FFEE',
    top: '🎵',
    title: 'NOUVEAU SON',
    subtitle: 'GUIBOUR',
    desc: 'EP 2026\nÉCOUTE MAINTENANT',
    cta: 'JUKEBOX →',
    ctaBg: '#0047AB',
  },
  {
    bg: 'linear-gradient(180deg, #1A0A00 0%, #2A1500 100%)',
    accent: '#FFD700',
    top: '🏆',
    title: 'CLASSEMENT',
    subtitle: '#1',
    desc: 'QUI SERA LE MEILLEUR\nEMPLOYÉ DE GUIBOUR ?',
    cta: 'VOIR →',
    ctaBg: '#D4A020',
  },
];

export default function TowerProgress({ currentLevel, totalLevels, assets, isAdMode = false }: Props) {
  const towerImg = assets?.tower;
  const adSlide = AD_SLIDES[Math.floor(Date.now() / 10000) % AD_SLIDES.length];

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: '110px',
        height: '100%',
        background: '#0A1520',
      }}
    >
      {/* Tower background image */}
      {towerImg && (
        <img
          src={towerImg.src}
          alt="Tour de progression"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />
      )}

      {/* Floor markers — always rendered, hidden behind ad overlay */}
      <div
        className="relative flex flex-col-reverse justify-between"
        style={{ height: '100%', padding: '8px 6px', zIndex: 1 }}
      >
        {Array.from({ length: totalLevels }, (_, i) => {
          const isCompleted = i < currentLevel;
          const isCurrent = i === currentLevel;
          const isFuture = i > currentLevel;

          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                height: `${100 / totalLevels}%`,
                minHeight: '12px',
              }}
            >
              <div
                style={{
                  width: '90%',
                  padding: '1px 0',
                  textAlign: 'center',
                  fontSize: '9px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontWeight: isCurrent ? 800 : 400,
                  letterSpacing: '0.5px',
                  borderRadius: '2px',
                  color: isCurrent ? '#0A1520' : isCompleted ? '#fff' : '#607888',
                  background: isCurrent
                    ? '#00C9C8'
                    : isCompleted
                    ? 'rgba(0,168,157,0.4)'
                    : isFuture
                    ? 'rgba(96,120,136,0.15)'
                    : 'transparent',
                  boxShadow: isCurrent ? '0 0 8px rgba(0,168,157,0.6)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {String(i).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AD OVERLAY ── */}
      {isAdMode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background: adSlide.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px 8px',
            animation: 'adSlideIn 0.4s cubic-bezier(.15,0,.25,1) both',
            borderLeft: `2px solid ${adSlide.accent}`,
            boxShadow: `inset -4px 0 24px rgba(0,0,0,0.5), 0 0 20px ${adSlide.accent}22`,
          }}
        >
          {/* Blinking AD badge */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '1px',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '1px 4px',
            borderRadius: '2px',
          }}>PUB</div>

          {/* Icon */}
          <div style={{ fontSize: '28px', lineHeight: 1 }}>{adSlide.top}</div>

          {/* Title */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '2px',
            textAlign: 'center',
          }}>{adSlide.title}</div>

          {/* Main text */}
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '22px',
            fontWeight: 900,
            color: adSlide.accent,
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: `0 0 16px ${adSlide.accent}88, 1px 2px 0 rgba(0,0,0,0.8)`,
          }}>{adSlide.subtitle}</div>

          {/* Description */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            lineHeight: 1.5,
            letterSpacing: '0.5px',
            whiteSpace: 'pre-line',
          }}>{adSlide.desc}</div>

          {/* CTA */}
          <div style={{
            marginTop: '4px',
            background: adSlide.ctaBg,
            color: '#fff',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '2px',
            padding: '5px 10px',
            width: '100%',
            textAlign: 'center',
            boxShadow: `0 0 12px ${adSlide.accent}44`,
          }}>{adSlide.cta}</div>

          {/* Bottom ticker */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: 0,
            right: 0,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '7px',
            color: `${adSlide.accent}66`,
            textAlign: 'center',
            letterSpacing: '1px',
          }}>guibour.fr</div>
        </div>
      )}
    </div>
  );
}
