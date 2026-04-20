'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';
import { formatSalary } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/gameTypes';

// -- Helpers --
function getRankTitle(rank: number): string {
  if (rank === 1) return 'DIRECTEUR GENERAL';
  if (rank === 2) return 'DIRECTEUR';
  if (rank === 3) return 'MANAGER';
  return 'EMPLOYE';
}

const RANK_COLORS = ['#1A1A1A', '#666', '#999'];
const MEDALS      = ['1', '2', '3'];
const HEIGHTS     = [120, 85, 65]; // podium column heights
const ORDER       = [1, 0, 2];     // centre = #1

// -- Image compression helper (client-side) --
function compressImage(file: File, maxW = 300, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// -- Podium Card --
function PodiumCard({
  entry, rank, index, photo, isMe, onUploadPhoto, uploading,
}: {
  entry: LeaderboardEntry;
  rank: number; index: number;
  photo?: string; isMe: boolean;
  onUploadPhoto: (rank: number) => void;
  uploading: boolean;
}) {
  const c = RANK_COLORS[index];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '0', order: ORDER[index],
    }}>
      {/* Avatar area */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div style={{
          width: rank === 1 ? '88px' : '72px',
          height: rank === 1 ? '88px' : '72px',
          borderRadius: '50%',
          border: `2px solid ${c}`,
          overflow: 'hidden',
          background: '#F5F0E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isMe ? 'pointer' : 'default',
          transition: 'border-color .3s',
        }}
          onClick={() => isMe && onUploadPhoto(rank)}
          title={isMe ? 'Cliquez pour ajouter votre photo' : undefined}
        >
          {photo ? (
            <img src={photo} alt={entry.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: rank === 1 ? '28px' : '22px', fontFamily: "'Anton', sans-serif", color: c }}>
              {MEDALS[index]}
            </span>
          )}
        </div>

        {/* Upload hint for current player */}
        {isMe && (
          <div style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#1A1A1A',
            border: '2px solid #F5F0E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', cursor: 'pointer', color: '#fff',
          }}
            onClick={() => onUploadPhoto(rank)}
          >
            {uploading ? '...' : '+'}
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${c}`,
        padding: '16px 24px', textAlign: 'center',
        minWidth: rank === 1 ? '160px' : '136px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Rank number */}
        <div style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: rank === 1 ? '28px' : '22px',
          color: c,
          lineHeight: 1,
        }}>{rank}</div>

        <div style={{
          fontFamily: "'Anton', sans-serif", fontSize: '14px',
          color: '#1A1A1A', letterSpacing: '2px', marginTop: '5px',
        }}>{entry.name}</div>

        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: '11px',
          color: '#666', letterSpacing: '2px', marginTop: '3px',
        }}>{getRankTitle(rank)}</div>

        <div style={{
          fontFamily: "'Anton', sans-serif", fontSize: rank === 1 ? '17px' : '14px',
          color: '#1A1A1A', marginTop: '6px',
        }}>{formatSalary(entry.score)}</div>

        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: '11px',
          color: '#999', marginTop: '3px',
        }}>ETG {entry.level}</div>

        {isMe && (
          <div style={{
            marginTop: '8px', fontFamily: "'Courier New', monospace",
            fontSize: '11px', color: '#1A1A1A', letterSpacing: '2px',
          }}>C&apos;EST VOUS</div>
        )}
      </div>

      {/* Podium column */}
      <div style={{
        width: '100%', height: `${HEIGHTS[index]}px`,
        background: index === 0 ? 'rgba(0,0,0,.08)' : index === 1 ? 'rgba(0,0,0,.05)' : 'rgba(0,0,0,.03)',
        border: `1px solid ${c}`,
        borderBottom: 'none',
        position: 'relative', overflow: 'hidden',
      }} />
    </div>
  );
}

// -- Main Page --
export default function ResultatsPage() {
  const [board,        setBoard]       = useState<LeaderboardEntry[]>([]);
  const [playerCount,  setPlayerCount] = useState<number | null>(null);
  const [loading,      setLoading]     = useState(true);
  const [lastUpdate,   setLastUpdate]  = useState('');
  const [photos,       setPhotos]      = useState<Record<string, string>>({});
  const [uploading,    setUploading]   = useState(false);
  const [myEmpId,      setMyEmpId]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRankRef = useRef<number>(0);

  // Get current player's employeeId from localStorage
  useEffect(() => {
    try {
      const pid = localStorage.getItem('guibour_playerIdentity');
      if (pid) {
        const p = JSON.parse(pid) as { employeeId?: string };
        if (p.employeeId) setMyEmpId(p.employeeId);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const data = await res.json() as { entries?: LeaderboardEntry[] };
      if (Array.isArray(data.entries)) {
        setBoard(data.entries);
        setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
        // Fetch photos for all players (batched by 10)
        const allIds = data.entries.map((e: LeaderboardEntry) => e.employeeId).filter(Boolean);
        if (allIds.length > 0) {
          const allPhotos: Record<string, string> = {};
          for (let i = 0; i < allIds.length; i += 10) {
            const batch = allIds.slice(i, i + 10);
            const pRes = await fetch(`/api/photo?ids=${batch.join(',')}`, { cache: 'no-store' });
            const pData = await pRes.json() as Record<string, string>;
            Object.assign(allPhotos, pData);
          }
          setPhotos(allPhotos);
        }
      }
    } catch { /* silently fail */ } finally { setLoading(false); }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/players');
      const data = await res.json() as { count?: number };
      setPlayerCount(data.count ?? null);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchBoard();
    fetchCount();
    const id = setInterval(() => { fetchBoard(); fetchCount(); }, 30000);
    return () => clearInterval(id);
  }, [fetchBoard, fetchCount]);

  // Handle photo upload
  const handleUploadPhoto = useCallback((rank: number) => {
    uploadRankRef.current = rank;
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myEmpId) return;
    e.target.value = '';
    setUploading(true);
    try {
      const b64 = await compressImage(file, 300, 0.78);
      await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: myEmpId, photo: b64 }),
      });
      setPhotos(prev => ({ ...prev, [myEmpId]: b64 }));
    } catch { /* ignore */ } finally { setUploading(false); }
  }, [myEmpId]);

  const topThree = board.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <ExcelNav />
      <ExcelChrome formulaText={`=RANK(JOUEURS) // TOTAL:${board.length} // W.O.W_LEADERBOARD`} breadcrumb="ETAGE 1 > CLASSEMENT">

        <div style={{
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* -- HEADER -- */}
          <div style={{
            background: '#FFFFFF',
            padding: '28px 48px 24px',
            borderBottom: '1px solid #D4CFC4',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <GlobeIcon size={52} color="#1A1A1A" />
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '5px', marginBottom: '4px' }}>
                  01 / CLASSEMENT
                </div>
                <div style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(22px,4vw,36px)', color: '#1A1A1A',
                  letterSpacing: '4px', lineHeight: 1,
                }}>RESULTATS</div>
                <div style={{
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  color: '#666', letterSpacing: '4px', marginTop: '4px',
                }}>W.O.W — CLASSEMENT GENERAL</div>
              </div>
            </div>

            {/* Stats badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'EN JEU',    value: playerCount !== null ? `${playerCount}` : '...' },
                { label: 'INSCRITS',  value: String(board.length).padStart(3, '0') },
                { label: 'MEILLEUR',  value: board[0] ? formatSalary(board[0].score) : '—' },
                { label: 'NIVEAU MAX',value: board[0] ? `ETG ${board[0].level}` : '—' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '12px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #D4CFC4',
                }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '3px' }}>{s.label}</div>
                  <div style={{
                    fontFamily: "'Anton', sans-serif", fontSize: '18px',
                    color: '#1A1A1A', marginTop: '3px',
                  }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 60px' }}>

            {/* -- PODIUM -- */}
            {topThree.length >= 1 && (
              <div style={{ marginBottom: '56px' }}>
                <div style={{
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  color: '#999', letterSpacing: '5px', marginBottom: '32px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  PODIUM
                  <span style={{ flex: 1, height: '1px', background: '#D4CFC4' }} />
                  {myEmpId && (
                    <span style={{
                      fontFamily: "'Courier New', monospace", fontSize: '11px',
                      color: '#666', letterSpacing: '2px',
                    }}>CLIQUEZ SUR VOTRE AVATAR POUR AJOUTER VOTRE PHOTO</span>
                  )}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'flex-end',
                  justifyContent: 'center', gap: '20px',
                }}>
                  {topThree.map((entry, i) => (
                    <PodiumCard
                      key={entry.employeeId ?? entry.name}
                      entry={entry} rank={i + 1} index={i}
                      photo={entry.employeeId ? photos[entry.employeeId] : undefined}
                      isMe={!!myEmpId && entry.employeeId === myEmpId}
                      onUploadPhoto={handleUploadPhoto}
                      uploading={uploading}
                    />
                  ))}
                </div>
              </div>
            )}

            {loading && board.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '60px',
                fontFamily: "'Courier New', monospace", fontSize: '10px',
                color: '#999', letterSpacing: '3px',
              }}>CHARGEMENT...</div>
            )}

            {/* -- TABLEAU -- */}
            {!loading && (
              <>
                <div style={{
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  color: '#999', letterSpacing: '5px', marginBottom: '14px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  CLASSEMENT COMPLET
                  <span style={{ flex: 1, height: '1px', background: '#D4CFC4' }} />
                  <span style={{ fontSize: '11px' }}>={board.length} ENTREES</span>
                </div>

                <div style={{
                  border: '1px solid #D4CFC4',
                  overflow: 'hidden',
                }}>
                  {/* Table header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '56px 1fr 170px 90px 150px',
                    background: '#1A1A1A',
                    borderBottom: '2px solid #1A1A1A',
                  }}>
                    {['RANG', 'PSEUDO', 'TITRE', 'NIVEAU', 'SALAIRE'].map(col => (
                      <div key={col} style={{
                        padding: '12px 16px',
                        fontFamily: "'Courier New', monospace", fontSize: '11px',
                        color: '#FFFFFF', letterSpacing: '2px',
                        borderRight: '1px solid rgba(255,255,255,.1)',
                      }}>{col}</div>
                    ))}
                  </div>

                  {board.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', background: '#FFFFFF' }}>
                      <div style={{
                        fontFamily: "'Anton', sans-serif", fontSize: '22px',
                        color: '#999', letterSpacing: '4px', marginBottom: '8px',
                      }}>AUCUN RESULTAT</div>
                      <div style={{
                        fontFamily: "'Courier New', monospace", fontSize: '10px',
                        color: '#CCC', letterSpacing: '2px',
                      }}>JOUEZ POUR APPARAITRE ICI</div>
                    </div>
                  ) : board.map((entry, i) => {
                    const isMedal = i < 3;
                    const isCurrentPlayer = !!myEmpId && entry.employeeId === myEmpId;
                    return (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '56px 1fr 170px 90px 150px',
                        background: isCurrentPlayer
                          ? 'rgba(0,0,0,.04)'
                          : i % 2 === 0 ? '#FFFFFF' : '#FAFAF5',
                        borderBottom: '1px solid #EDE8DF',
                        borderLeft: `3px solid ${isMedal ? '#1A1A1A' : isCurrentPlayer ? '#666' : 'transparent'}`,
                        transition: 'background .15s',
                      }}>
                        {/* Rang */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Anton', sans-serif", fontSize: '20px',
                          color: isMedal ? '#1A1A1A' : '#999',
                          borderRight: '1px solid #EDE8DF',
                          display: 'flex', alignItems: 'center',
                        }}>{i + 1}</div>

                        {/* Pseudo + Photo */}
                        <div style={{
                          padding: '8px 14px',
                          fontFamily: "'Courier New', monospace", fontSize: '12px',
                          color: isCurrentPlayer ? '#1A1A1A' : isMedal ? '#1A1A1A' : '#666',
                          fontWeight: i === 0 ? 700 : 400,
                          borderRight: '1px solid #EDE8DF',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          {/* Avatar / photo */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            border: `1px solid ${isMedal ? '#1A1A1A' : '#D4CFC4'}`,
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#F5F0E8',
                            cursor: isCurrentPlayer ? 'pointer' : 'default',
                          }}
                            onClick={() => isCurrentPlayer && handleUploadPhoto(i + 1)}
                            title={isCurrentPlayer ? 'Ajouter ta photo' : undefined}
                          >
                            {entry.employeeId && photos[entry.employeeId] ? (
                              <img src={photos[entry.employeeId]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '11px', opacity: 0.4, fontFamily: "'Courier New', monospace" }}>
                                {isCurrentPlayer ? '+' : '?'}
                              </span>
                            )}
                          </div>
                          {entry.name}
                        </div>

                        {/* Titre */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Courier New', monospace", fontSize: '11px',
                          color: '#666', letterSpacing: '1px',
                          borderRight: '1px solid #EDE8DF',
                          display: 'flex', alignItems: 'center',
                        }}>{getRankTitle(i + 1)}</div>

                        {/* Niveau */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Anton', sans-serif", fontSize: '18px',
                          color: '#1A1A1A',
                          borderRight: '1px solid #EDE8DF',
                          display: 'flex', alignItems: 'center',
                        }}>{entry.level}</div>

                        {/* Salaire */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Anton', sans-serif", fontSize: '16px',
                          color: '#1A1A1A',
                          display: 'flex', alignItems: 'center',
                        }}>{formatSalary(entry.score)}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '12px',
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  color: '#999', letterSpacing: '2px',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>=LAST_UPDATE() // {lastUpdate || '...'}</span>
                  <span>W.O.W / WORK OR WINDOW / 2026</span>
                </div>
              </>
            )}
          </div>
        </div>
      </ExcelChrome>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
