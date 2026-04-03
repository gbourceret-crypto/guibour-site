'use client';

import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import { useState } from 'react';

// ── CATALOGUE ────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 1,
    title: "DON'T TALK TO ME",
    bpm: 128,
    mood: 'RAW',
    moodColor: '#FF4444',
    spotifyId: '0eAziZNCXORNa9kDbY91wE',
    youtubeId: 'oOdwfvDwXcM',
    hasClip: true,
    released: true,
  },
  {
    id: 2,
    title: 'LE 11',
    bpm: 95,
    mood: 'SOUL',
    moodColor: '#00C8BE',
    spotifyId: '6oEnxkmtM9Jw68Q9r3UkC2',
    youtubeId: null,
    hasClip: false,
    released: true,
  },
  {
    id: 3,
    title: '[PROCHAINEMENT]',
    bpm: null,
    mood: '???',
    moodColor: '#607888',
    spotifyId: null,
    youtubeId: null,
    hasClip: false,
    released: false,
  },
];

const WOW_PLAYLIST_URL =
  'https://open.spotify.com/playlist/0J6cPuFnzRn8IUVBP2Q2g8?si=wow_sounds_guibour';
const YOUTUBE_CHANNEL = 'https://www.youtube.com/@Guibour?sub_confirmation=1';
const SPOTIFY_ARTIST  = 'https://open.spotify.com/intl-fr/artist/6xSqhm0F1HfJXiudOKlrGL';

export default function JukeboxPage() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [view, setView] = useState<'audio' | 'clip'>('audio');
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  const handleSave = (trackId: number, spotifyId: string) => {
    window.open(`https://open.spotify.com/track/${spotifyId}`, '_blank');
    setSaved(prev => ({ ...prev, [trackId]: true }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg, #1A3F78)' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=PLAY("GUIBOUR_EP","JUKEBOX_2026") → BROADCAST_MODE_ON'>
        <div style={{ padding: '32px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>

          {/* ── HEADER ── */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '5px', marginBottom: '8px' }}>
              GUIBOUR SYSTEM // BROADCAST CENTER // 2026
            </div>
            <h1 style={{
              fontFamily: "'Luckiest Guy', cursive",
              fontSize: 'clamp(40px, 7vw, 72px)',
              color: '#FFFFFF',
              letterSpacing: '6px',
              lineHeight: 1,
              textShadow: '3px 5px 0 #0C2A62, 0 0 40px rgba(0,200,190,.3)',
              marginBottom: '6px',
            }}>JUKEBOX</h1>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#00D4CC', letterSpacing: '4px' }}>
              ÉCOUTER · REGARDER · ENREGISTRER
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

            {/* ── LEFT COLUMN — PLAYER + TRACKLIST ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── PLAYER ZONE ── */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Player header bar */}
                <div style={{
                  background: '#0A2254',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #1A3E7A',
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F', display: 'inline-block' }} />
                  </div>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '2px' }}>
                    GUIBOUR.JUKEBOX — {activeTrack.title}
                  </span>
                  {/* View toggle */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['audio', 'clip'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        disabled={v === 'clip' && !activeTrack.hasClip}
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '8px',
                          letterSpacing: '1px',
                          padding: '4px 10px',
                          background: view === v ? '#0047AB' : 'transparent',
                          color: view === v ? '#fff' : (v === 'clip' && !activeTrack.hasClip) ? '#2B4060' : '#5B9BD5',
                          border: `1px solid ${view === v ? '#00C8BE' : '#1A3E7A'}`,
                          cursor: (v === 'clip' && !activeTrack.hasClip) ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          transition: 'all .15s',
                        }}
                      >
                        {v === 'audio' ? '♪ AUDIO' : '▶ CLIP'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player iframe */}
                <div style={{ position: 'relative' }}>
                  {view === 'audio' && activeTrack.spotifyId ? (
                    <iframe
                      src={`https://open.spotify.com/embed/track/${activeTrack.spotifyId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      style={{ display: 'block', border: 'none' }}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  ) : view === 'clip' && activeTrack.youtubeId ? (
                    <iframe
                      width="100%"
                      height="380"
                      src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                      title={`${activeTrack.title} — Guibour`}
                      style={{ display: 'block', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div style={{
                      height: '152px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
                      color: '#3C5A7A', letterSpacing: '3px',
                    }}>
                      {!activeTrack.released ? 'BIENTÔT DISPONIBLE' : 'PAS DE CLIP DISPONIBLE'}
                    </div>
                  )}
                </div>

                {/* Save + links bar */}
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #1A3E7A',
                  background: '#091E4A',
                }}>
                  {activeTrack.spotifyId && (
                    <button
                      onClick={() => handleSave(activeTrack.id, activeTrack.spotifyId!)}
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '9px',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        background: saved[activeTrack.id] ? '#1A8A5A' : 'linear-gradient(135deg, #1DB954, #169940)',
                        color: '#fff',
                        border: '1px solid ' + (saved[activeTrack.id] ? '#27C93F' : '#1DB954'),
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all .2s',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {saved[activeTrack.id] ? '✓ ENREGISTRÉ' : '+ ENREGISTRER SUR SPOTIFY'}
                    </button>
                  )}
                  {activeTrack.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${activeTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '9px',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                        color: '#fff',
                        border: '1px solid #FF4444',
                        textDecoration: 'none',
                        borderRadius: '2px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      ▶ YOUTUBE
                    </a>
                  )}
                  <a
                    href={SPOTIFY_ARTIST}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '9px',
                      letterSpacing: '2px',
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#1DB954',
                      border: '1px solid #1A3E7A',
                      textDecoration: 'none',
                      borderRadius: '2px',
                    }}
                  >
                    PROFIL ARTISTE →
                  </a>
                </div>
              </div>

              {/* ── TRACKLIST ── */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 60px 60px 80px',
                  padding: '8px 16px',
                  background: '#1A3E7A',
                  borderBottom: '1px solid #2B5090',
                }}>
                  {['#', 'TITRE', 'BPM', 'MOOD', ''].map((h, i) => (
                    <div key={i} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', letterSpacing: '2px' }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Tracks */}
                {TRACKS.map((track, i) => {
                  const isActive = activeTrack.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => track.released && setActiveTrack(track)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 1fr 60px 60px 80px',
                        padding: '12px 16px',
                        background: isActive ? 'rgba(0,71,171,.22)' : 'transparent',
                        borderBottom: '1px solid rgba(26,62,122,.4)',
                        cursor: track.released ? 'pointer' : 'default',
                        borderLeft: isActive ? '3px solid #00C8BE' : '3px solid transparent',
                        transition: 'all .15s',
                        opacity: track.released ? 1 : 0.4,
                      }}
                      onMouseEnter={e => { if (track.released && !isActive) e.currentTarget.style.background = 'rgba(0,71,171,.1)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: isActive ? '#00C8BE' : '#3C5A7A' }}>
                        {isActive ? '▶' : String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: isActive ? '#FFFFFF' : '#A8D8FF', letterSpacing: '1px' }}>
                          {track.title}
                        </div>
                        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', marginTop: '2px' }}>
                          GUIBOUR {track.hasClip ? '· CLIP DISPO' : ''}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', alignSelf: 'center' }}>
                        {track.bpm ?? '—'}
                      </div>
                      <div style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '8px', fontWeight: 700,
                        color: track.moodColor, alignSelf: 'center',
                        padding: '2px 6px', border: `1px solid ${track.moodColor}22`,
                        background: `${track.moodColor}18`,
                        borderRadius: '2px', letterSpacing: '1px',
                        width: 'fit-content',
                      }}>
                        {track.mood}
                      </div>
                      <div style={{ alignSelf: 'center' }}>
                        {track.spotifyId && (
                          <button
                            onClick={e => { e.stopPropagation(); handleSave(track.id, track.spotifyId!); }}
                            style={{
                              fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                              padding: '4px 8px', background: 'transparent',
                              color: saved[track.id] ? '#27C93F' : '#1DB954',
                              border: `1px solid ${saved[track.id] ? '#27C93F' : '#1A3E7A'}`,
                              cursor: 'pointer', borderRadius: '2px', whiteSpace: 'nowrap',
                            }}
                          >
                            {saved[track.id] ? '✓' : '+ SAVE'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT COLUMN — INFO + LINKS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* About card */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#1A3E7A', padding: '8px 14px', borderBottom: '1px solid #2B5090' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#A8D8FF', letterSpacing: '3px' }}>DOSSIER ARTISTE</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '42px', textAlign: 'center', marginBottom: '8px' }}>🎤</div>
                  <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '28px', color: '#FFFFFF', textAlign: 'center', letterSpacing: '4px', textShadow: '2px 3px 0 #0C2A62' }}>
                    GUIBOUR
                  </div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00D4CC', textAlign: 'center', letterSpacing: '4px', marginBottom: '16px' }}>
                    ARTISTE · EP 2026
                  </div>
                  <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', lineHeight: 1.7, letterSpacing: '0.5px' }}>
                    Artiste indépendant. Un EP en cours de sortie. Un jeu web. Une satire du monde du travail.
                    Work Or Window — le son du bureau qui brûle.
                  </p>
                </div>
              </div>

              {/* Platform links */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#1A3E7A', padding: '8px 14px', borderBottom: '1px solid #2B5090' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#A8D8FF', letterSpacing: '3px' }}>ÉCOUTER PARTOUT</span>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'SPOTIFY', url: SPOTIFY_ARTIST, color: '#1DB954', icon: '🎵' },
                    { label: 'YOUTUBE', url: YOUTUBE_CHANNEL, color: '#FF0000', icon: '▶' },
                    { label: 'PLAYLIST W.O.W SOUNDS', url: WOW_PLAYLIST_URL, color: '#00C8BE', icon: '📋' },
                  ].map(({ label, url, color, icon }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        background: `${color}12`,
                        border: `1px solid ${color}30`,
                        borderRadius: '3px',
                        textDecoration: 'none',
                        transition: 'all .2s',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '9px',
                        color: color,
                        letterSpacing: '2px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}30`; }}
                    >
                      <span style={{ fontSize: '16px' }}>{icon}</span>
                      {label}
                      <span style={{ marginLeft: 'auto', opacity: 0.6 }}>→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* W.O.W Sounds playlist card */}
              <div style={{
                background: 'linear-gradient(135deg, #0A2254, #0C2A62)',
                border: '2px solid #00C8BE',
                borderRadius: '4px',
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '16px', color: '#00C8BE', letterSpacing: '3px', marginBottom: '8px' }}>
                  W.O.W SOUNDS
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', lineHeight: 1.6, marginBottom: '12px' }}>
                  LA PLAYLIST COLLABORATIVE — AJOUTE TON SON PRÉFÉRÉ
                </div>
                <a
                  href={WOW_PLAYLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #1DB954, #169940)',
                    color: '#fff',
                    border: '1px solid #1DB954',
                    textDecoration: 'none',
                    letterSpacing: '2px',
                    borderRadius: '2px',
                  }}
                >
                  + REJOINDRE LA PLAYLIST
                </a>
              </div>

              {/* YouTube subscribe */}
              <a
                href={YOUTUBE_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #1A0000, #2A0000)',
                  border: '2px solid #FF0000',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  transition: 'all .2s',
                  animation: 'pulse 3s ease-in-out infinite',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #2A0000, #3A0000)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,0,.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #1A0000, #2A0000)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ fontSize: '28px' }}>▶</span>
                <div>
                  <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '14px', color: '#FF4444', letterSpacing: '2px' }}>
                    S&apos;ABONNER YOUTUBE
                  </div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#FF8888', letterSpacing: '1px' }}>
                    @GUIBOUR — CLIPS & CONTENU
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#FF4444', fontSize: '18px' }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
