'use client';

import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const AudioReactiveGrid = dynamic(() => import('@/components/ui/AudioReactiveGrid'), { ssr: false });

// -- CATALOGUE --
const TRACKS = [
  {
    id: 1,
    title: "DON'T TALK TO ME",
    bpm: 128,
    mood: 'RAW',
    spotifyId: '6oEnxkmtM9Jw68Q9r3UkC2',
    youtubeId: 'oOdwfvDwXcM',
    hasClip: true,
    released: true,
  },
  {
    id: 2,
    title: 'LE 11',
    bpm: 95,
    mood: 'SOUL',
    spotifyId: '0eAziZNCXORNa9kDbY91wE',
    youtubeId: 'WL7Vi7dQsP8',
    hasClip: true,
    released: true,
  },
  {
    id: 3,
    title: '[PROCHAINEMENT]',
    bpm: null,
    mood: '???',
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

  const gridActive = activeTrack.released && !!(activeTrack.spotifyId || activeTrack.youtubeId);

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <AudioReactiveGrid active={false} bpm={activeTrack.bpm ?? 120} />
      <ExcelNav />
      <ExcelChrome formulaText='=PLAY("GUIBOUR_EP","VIDEO_MUSIC_BOX_2026")' breadcrumb="ETAGE 2 > SALLE D'ECOUTE">
        <div style={{
          minHeight: 'calc(100vh - 52px)',
        }}>

        {/* -- HERO HEADER -- */}
        <ScrollReveal><div style={{
          background: '#FFFFFF',
          padding: '36px 48px 28px',
          borderBottom: '1px solid #D4CFC4',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '24px', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '5px', marginBottom: '8px' }}>
              02 / SALLE D&apos;ECOUTE
            </div>
            <h1 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(28px,5vw,52px)',
              color: '#1A1A1A', letterSpacing: '4px', lineHeight: 1,
              marginBottom: '6px',
            }}>VIDEO &amp; MUSIC BOX</h1>
            <div style={{
              fontFamily: "'Courier New', monospace", fontSize: '11px',
              color: '#666', letterSpacing: '4px',
            }}>ECOUTER / REGARDER / PARTAGER</div>
          </div>
        </div></ScrollReveal>

        <div style={{ padding: '28px 24px 60px', maxWidth: '940px', margin: '0 auto' }}>

          <ScrollReveal><div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>

            {/* -- LEFT COLUMN -- PLAYER + TRACKLIST -- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* -- PLAYER ZONE -- */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #D4CFC4',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Player header bar */}
                <div style={{
                  background: '#F5F0E8',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #D4CFC4',
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#CCC', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#CCC', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#CCC', display: 'inline-block' }} />
                  </div>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '2px' }}>
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
                          fontFamily: "'Courier New', monospace",
                          fontSize: '11px',
                          letterSpacing: '1px',
                          padding: '4px 12px',
                          background: view === v ? '#1A1A1A' : 'transparent',
                          color: view === v ? '#fff' : (v === 'clip' && !activeTrack.hasClip) ? '#CCC' : '#666',
                          border: `1px solid ${view === v ? '#1A1A1A' : '#D4CFC4'}`,
                          cursor: (v === 'clip' && !activeTrack.hasClip) ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          transition: 'all .15s',
                        }}
                      >
                        {v === 'audio' ? 'AUDIO' : 'CLIP'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player iframe */}
                <div style={{ position: 'relative' }}>
                  {view === 'audio' && activeTrack.spotifyId ? (
                    <iframe
                      key={activeTrack.spotifyId}
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
                      fontFamily: "'Courier New', monospace", fontSize: '11px',
                      color: '#999', letterSpacing: '3px',
                    }}>
                      {!activeTrack.released ? 'BIENTOT DISPONIBLE' : 'PAS DE CLIP DISPONIBLE'}
                    </div>
                  )}
                </div>

                {/* Save + links bar */}
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #D4CFC4',
                  background: '#F5F0E8',
                }}>
                  {activeTrack.spotifyId && (
                    <button
                      onClick={() => handleSave(activeTrack.id, activeTrack.spotifyId!)}
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '11px',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        background: saved[activeTrack.id] ? '#1A1A1A' : 'transparent',
                        color: saved[activeTrack.id] ? '#fff' : '#1A1A1A',
                        border: '1px solid #1A1A1A',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all .2s',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {saved[activeTrack.id] ? '+ ENREGISTRE' : '+ ENREGISTRER SUR SPOTIFY'}
                    </button>
                  )}
                  {activeTrack.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${activeTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '11px',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#1A1A1A',
                        border: '1px solid #1A1A1A',
                        textDecoration: 'none',
                        borderRadius: '2px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      YOUTUBE
                    </a>
                  )}
                  <a
                    href={SPOTIFY_ARTIST}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '11px',
                      letterSpacing: '2px',
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#1A1A1A',
                      border: '1px solid #D4CFC4',
                      textDecoration: 'none',
                      borderRadius: '2px',
                    }}
                  >
                    PROFIL ARTISTE
                  </a>
                </div>
              </div>

              {/* -- TRACKLIST -- */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #D4CFC4',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 80px',
                  padding: '8px 16px',
                  background: '#F5F0E8',
                  borderBottom: '1px solid #D4CFC4',
                }}>
                  {['#', 'TITRE', ''].map((h, i) => (
                    <div key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '2px' }}>
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
                        gridTemplateColumns: '32px 1fr 80px',
                        padding: '12px 16px',
                        background: isActive ? 'rgba(0,0,0,.03)' : 'transparent',
                        borderBottom: '1px solid #EDE8DF',
                        cursor: track.released ? 'pointer' : 'default',
                        borderLeft: isActive ? '3px solid #1A1A1A' : '3px solid transparent',
                        transition: 'all .15s',
                        opacity: track.released ? 1 : 0.4,
                      }}
                      onMouseEnter={e => { if (track.released && !isActive) e.currentTarget.style.background = 'rgba(0,0,0,.02)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: isActive ? '#1A1A1A' : '#999' }}>
                        {isActive ? '>' : String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '13px', color: isActive ? '#1A1A1A' : '#444', letterSpacing: '1px' }}>
                          {track.title}
                        </div>
                        <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', marginTop: '2px' }}>
                          GUIBOUR {track.hasClip ? '/ CLIP DISPO' : ''}
                        </div>
                      </div>
                      <div style={{ alignSelf: 'center' }}>
                        {track.spotifyId && (
                          <button
                            onClick={e => { e.stopPropagation(); handleSave(track.id, track.spotifyId!); }}
                            style={{
                              fontFamily: "'Courier New', monospace", fontSize: '11px',
                              padding: '4px 8px', background: 'transparent',
                              color: saved[track.id] ? '#1A1A1A' : '#666',
                              border: `1px solid ${saved[track.id] ? '#1A1A1A' : '#D4CFC4'}`,
                              cursor: 'pointer', borderRadius: '2px', whiteSpace: 'nowrap',
                            }}
                          >
                            {saved[track.id] ? 'OK' : '+ SAVE'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* -- RIGHT COLUMN -- INFO + LINKS -- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* About card -- photo artiste */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #D4CFC4',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#F5F0E8', padding: '8px 16px', borderBottom: '1px solid #D4CFC4' }}>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#1A1A1A', letterSpacing: '3px' }}>DOSSIER ARTISTE</span>
                </div>
                {/* Photo */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/artist-photo.jpg"
                    alt="Guibour"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                  {/* Overlay gradient + name */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,.7))',
                    padding: '24px 14px 14px',
                  }}>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '22px', color: '#FFF', letterSpacing: '4px' }}>
                      GUIBOUR
                    </div>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#DDD', letterSpacing: '4px' }}>
                      ARTISTE / EP 2026
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#444', lineHeight: 1.7, letterSpacing: '0.5px' }}>
                    Artiste independant. Un EP en cours de sortie. Un jeu web. Une satire du monde du travail.
                    Work Or Window — le son du bureau qui brule.
                  </p>
                </div>
              </div>

              {/* Platform links */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #D4CFC4',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#F5F0E8', padding: '8px 16px', borderBottom: '1px solid #D4CFC4' }}>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#1A1A1A', letterSpacing: '3px' }}>ECOUTER PARTOUT</span>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'SPOTIFY', url: SPOTIFY_ARTIST },
                    { label: 'YOUTUBE', url: YOUTUBE_CHANNEL },
                    { label: 'PLAYLIST W.O.W SOUNDS', url: WOW_PLAYLIST_URL },
                    { label: 'CONCERT 24 JUIN', url: 'https://shotgun.live/fr/events/guibour-la-boule-noire' },
                  ].map(({ label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: '1px solid #D4CFC4',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        transition: 'all .2s',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '11px',
                        color: '#1A1A1A',
                        letterSpacing: '2px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4CFC4'; }}
                    >
                      {label}
                      <span style={{ marginLeft: 'auto', opacity: 0.4 }}>-&gt;</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* YouTube subscribe -- compact */}
              <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#FFFFFF', border: '1px solid #D4CFC4', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4CFC4'; }}>
                <div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '13px', color: '#1A1A1A', letterSpacing: '2px' }}>S&apos;ABONNER</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '1px' }}>@GUIBOUR</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#1A1A1A', fontSize: '16px' }}>-&gt;</span>
              </a>
            </div>
          </div></ScrollReveal>
        </div>{/* maxWidth container */}

        </div>{/* min-h wrapper */}
      </ExcelChrome>
    </div>
  );
}
