'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState, startGame, updateGame, renderGame, setGameAssets } from '@/lib/gameEngine';
import { GameState } from '@/lib/gameTypes';
import { loadAllAssets, GameAssets } from '@/lib/assetLoader';
import { LEVELS } from '@/lib/levels';
import { audioManager } from '@/lib/audioManager';
import TowerProgress from './TowerProgress';
import GameOverScreen from './GameOverScreen';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const [gameStatus, setGameStatus] = useState<GameState['status']>('idle');
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [assetsRef, setAssetsRef] = useState<GameAssets | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hudInfo, setHudInfo] = useState({ lives: 3, score: 0, levelName: '', phrase: '' });
  const [showPhrase, setShowPhrase] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [floorKey, setFloorKey] = useState(0); // key to retrigger floor animation
  // Ad rotation: every 30s during game, show ad for 10s
  const [isAdMode, setIsAdMode] = useState(false);
  const adIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Direct DOM refs for timer (avoid React re-render per frame)
  const timerFillRef = useRef<HTMLDivElement>(null);
  const timerTextRef = useRef<HTMLSpanElement>(null);
  const timerFormulaRef = useRef<HTMLSpanElement>(null);

  const isPlaying =
    gameStatus === 'playing' || gameStatus === 'burnout' || gameStatus === 'levelComplete';

  // Load assets on mount
  useEffect(() => {
    loadAllAssets((loaded, total) => {
      setLoadProgress(Math.floor((loaded / total) * 100));
    }).then(a => {
      setAssetsRef(a);
      setGameAssets(a);
      audioManager.init(a);
      setAssetsLoaded(true);
    });
  }, []);

  // Stop all audio when leaving the game page
  useEffect(() => {
    return () => {
      audioManager.stop('gameplay');
      audioManager.stop('gameover');
    };
  }, []);

  // Ad rotation system: fires every 30s for 10s during active game
  useEffect(() => {
    if (isPlaying) {
      adIntervalRef.current = setInterval(() => {
        setIsAdMode(true);
        adTimeoutRef.current = setTimeout(() => setIsAdMode(false), 10000);
      }, 30000);
    } else {
      setIsAdMode(false);
    }
    return () => {
      if (adIntervalRef.current) clearInterval(adIntervalRef.current);
      if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    };
  }, [isPlaying]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w;
    canvas.height = h;
    if (stateRef.current) {
      stateRef.current.canvasWidth = w;
      stateRef.current.canvasHeight = h;
    }
  }, []);

  useEffect(() => {
    if (!assetsLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    resize();
    stateRef.current = createInitialState(canvas.width, canvas.height);
    const ctx = canvas.getContext('2d')!;
    renderGame(ctx, stateRef.current);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize, assetsLoaded]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'burnout' && gameStatus !== 'levelComplete') return;

    let lastLevel = -1;
    const loop = () => {
      if (!stateRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d')!;
      stateRef.current = updateGame(stateRef.current);

      const s = stateRef.current;

      if (s.status === 'gameOver' || s.status === 'victory') {
        setGameStatus(s.status);
      } else if (s.status === 'burnout' && gameStatus !== 'burnout') {
        setGameStatus('burnout');
      } else if (s.status === 'levelComplete' && gameStatus !== 'levelComplete') {
        setGameStatus('levelComplete');
      } else if (s.status === 'playing' && (gameStatus === 'burnout' || gameStatus === 'levelComplete')) {
        setGameStatus('playing');
      }

      // Update HUD info
      if (s.level !== lastLevel) {
        lastLevel = s.level;
        setCurrentLevel(s.level);
        setFloorKey(k => k + 1);
        const lc = LEVELS[s.level];
        if (lc) {
          setHudInfo(prev => ({ ...prev, levelName: lc.name, phrase: lc.phrase }));
          setShowPhrase(true);
          setTimeout(() => setShowPhrase(false), 3000);
        }
      }
      setHudInfo(prev =>
        prev.lives === s.player.lives && prev.score === s.player.score
          ? prev
          : { ...prev, lives: s.player.lives, score: s.player.score }
      );

      // Update timer DOM directly (no React state = no re-render per frame)
      if (timerFillRef.current && s.timer) {
        const ratio = Math.max(0, s.timer.remaining / s.timer.total);
        const pct = (ratio * 100).toFixed(1);
        timerFillRef.current.style.width = pct + '%';
        const isRed = ratio < 0.15;
        const isOrange = ratio < 0.30;
        timerFillRef.current.style.background = isRed
          ? 'linear-gradient(90deg, #FF4444, #FF6666)'
          : isOrange
            ? 'linear-gradient(90deg, #FFA500, #FFD000)'
            : 'linear-gradient(90deg, #0047AB, #00A89D)';
        timerFillRef.current.style.boxShadow = isRed
          ? '0 0 8px rgba(255,68,68,0.6)'
          : '0 0 6px rgba(0,168,157,0.4)';
      }
      if (timerTextRef.current && s.timer) {
        timerTextRef.current.textContent = Math.ceil(s.timer.remaining) + 's';
      }
      if (timerFormulaRef.current && s.timer) {
        const secs = Math.ceil(s.timer.remaining);
        timerFormulaRef.current.textContent =
          `=DESTROY(DOSSIERS,SALAIRE) // RTT:${s.player.lives} // SCORE:${s.player.score.toLocaleString('fr-FR')}€ // TEMPS:${secs}s`;
      }

      renderGame(ctx, s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameStatus]);

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'q', 'd', 'z', 'w'].includes(e.key)) {
        e.preventDefault();
      }
      stateRef.current?.keys.add(e.key);
    };
    const onUp = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      stateRef.current?.keys.delete(e.key);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!stateRef.current) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < e.touches.length; i++) {
      const tx = e.touches[i].clientX - rect.left;
      const third = rect.width / 3;
      if (tx < third) stateRef.current.touchLeft = true;
      else if (tx > third * 2) stateRef.current.touchRight = true;
      else stateRef.current.touchShoot = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!stateRef.current) return;
    stateRef.current.touchLeft = false;
    stateRef.current.touchRight = false;
    stateRef.current.touchShoot = false;
  }, []);

  const handlePlay = () => setShowNameModal(true);

  const handleStart = () => {
    if (!playerName.trim()) return;
    setShowNameModal(false);
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setCurrentLevel(0);
    setFloorKey(k => k + 1);
    setGameStatus('playing');
    audioManager.play('gameplay');
  };

  const handleRestart = () => {
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setCurrentLevel(0);
    setFloorKey(k => k + 1);
    setGameStatus('playing');
    audioManager.play('gameplay');
  };

  // Stop gameplay music on game over/victory
  useEffect(() => {
    if (gameStatus === 'gameOver') {
      audioManager.stop('gameplay');
      audioManager.play('gameover');
    } else if (gameStatus === 'victory') {
      audioManager.stop('gameplay');
    }
  }, [gameStatus]);

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  // Loading screen
  if (!assetsLoaded) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4"
           style={{ background: '#0A1520' }}>
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '24px',
          fontWeight: 800,
          color: '#00A89D',
          letterSpacing: '4px',
        }}>
          W.O.W
        </h2>
        <p style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: '#607888',
          letterSpacing: '2px',
        }}>
          WORK OR WINDOW
        </p>
        <div style={{
          width: '200px',
          height: '6px',
          background: '#1A3A6A',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${loadProgress}%`,
            height: '100%',
            background: '#00A89D',
            transition: 'width 0.2s ease',
          }} />
        </div>
        <p style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: '#607888',
        }}>
          {loadProgress}%
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full" style={{ background: '#607888', gap: '3px', padding: '3px' }}>

      {/* ── LEFT COLUMN: canvas + floor indicator + timer + HUD ── */}
      <div className="flex flex-col flex-1" style={{ gap: '3px', minWidth: 0 }}>

        {/* Game canvas */}
        <div className="relative flex-1" style={{ background: '#0A1520', overflow: 'hidden', minHeight: 0 }}>
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          />

          {/* IDLE overlay */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
                 style={{ background: 'rgba(10,21,32,0.7)', backdropFilter: 'blur(3px)' }}>
              <div className="text-center">
                <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#fff', letterSpacing: '6px', textShadow: '0 0 20px rgba(0,168,157,0.5)' }}>
                  W.O.W
                </h1>
                <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '16px', color: '#00A89D', letterSpacing: '4px', marginTop: '6px' }}>
                  WORK OR WINDOW
                </p>
                <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', color: '#607888', letterSpacing: '2px', marginTop: '10px' }}>
                  25 ÉTAGES — SURVIVEZ À GUIBOUR CORP.
                </p>
              </div>
              <button
                onClick={handlePlay}
                className="cursor-pointer transition-all hover:brightness-110 active:scale-95"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '18px', fontWeight: 700, letterSpacing: '8px', color: '#fff', background: '#0047AB', border: '2px solid #00A89D', padding: '18px 60px', boxShadow: '0 0 30px rgba(0,71,171,0.3)' }}
              >
                JOUER
              </button>
              <div className="text-center" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#607888', letterSpacing: '1px' }}>
                <p>FLÈCHES / ZQSD POUR BOUGER — ESPACE POUR TIRER</p>
                <p style={{ marginTop: '6px' }}>MOBILE : GAUCHE/DROITE POUR BOUGER, CENTRE POUR TIRER</p>
              </div>
            </div>
          )}

          {/* Name modal */}
          {showNameModal && (
            <div className="absolute inset-0 z-30 flex items-center justify-center"
                 style={{ background: 'rgba(10,21,32,0.7)', backdropFilter: 'blur(4px)' }}>
              <div className="w-[440px] max-w-[90vw] overflow-hidden shadow-2xl"
                   style={{ animation: 'slideUp 0.3s ease-out', border: '2px solid #0047AB', background: '#fff' }}>
                <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0047AB' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FF5F56' }} />
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#27C93F' }} />
                    </div>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                      GUIBOUR CORP. — EMBAUCHE
                    </span>
                  </div>
                  <div className="flex gap-2 text-white/60" style={{ fontSize: '12px' }}>
                    <span>—</span><span>□</span><span>&#10005;</span>
                  </div>
                </div>
                <div className="flex items-center border-b" style={{ borderColor: '#C0D0DE', background: '#FAFAFA' }}>
                  <div className="flex items-center justify-center border-r px-2 py-1" style={{ borderColor: '#C0D0DE', background: '#E8E8E8' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#777' }}>fx</span>
                  </div>
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#0047AB', padding: '4px 8px' }}>
                    =EMBAUCHE(NOM_EMPLOYE)
                  </span>
                </div>
                <div className="p-6" style={{ background: '#F5F5F5' }}>
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', color: '#607888', letterSpacing: '1px', marginBottom: '14px' }}>
                    ENTREZ VOTRE NOM D&apos;EMPLOYÉ :
                  </p>
                  <input
                    type="text"
                    maxLength={16}
                    autoFocus
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                    placeholder="Nom..."
                    style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '16px', width: '100%', padding: '10px 12px', border: '1px solid #C8D8E8', background: '#fff', color: '#0A1520', outline: 'none', marginBottom: '14px' }}
                  />
                  <button
                    onClick={handleStart}
                    className="w-full cursor-pointer py-3 transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '4px', color: '#fff', background: '#0047AB', border: '1px solid #0A1520' }}
                  >
                    COMMENCER
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over / Victory */}
          {(gameStatus === 'gameOver' || gameStatus === 'victory') && stateRef.current && (
            <GameOverScreen state={stateRef.current} onRestart={handleRestart} />
          )}

          {/* Floor 00 controls tutorial */}
          {isPlaying && currentLevel === 0 && (
            <div style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              pointerEvents: 'none',
              zIndex: 10,
            }}>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '10px',
                color: 'rgba(0,168,157,0.7)',
                letterSpacing: '2px',
                marginBottom: '8px',
              }}>COMMANDES :</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {/* ESPACE button */}
                <div style={{
                  width: '160px',
                  height: '40px',
                  background: 'rgba(0,71,171,0.25)',
                  border: '2px solid rgba(0,71,171,0.6)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '12px',
                  color: '#fff',
                  letterSpacing: '3px',
                }}>ESPACE</div>
                {/* Arrow buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['←', '→'].map(a => (
                    <div key={a} style={{
                      width: '40px',
                      height: '36px',
                      background: 'rgba(0,71,171,0.25)',
                      border: '2px solid rgba(0,71,171,0.5)',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: '#fff',
                    }}>{a}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FLOOR INDICATOR — centered below canvas ── */}
        {isPlaying && (
          <div style={{
            flexShrink: 0,
            background: '#0D1D2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 0',
          }}>
            <div
              key={floorKey}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#0A1520',
                border: '2px solid rgba(0,71,171,0.5)',
                padding: '4px 28px',
                boxShadow: '0 0 20px rgba(0,168,157,0.12), inset 0 0 16px rgba(0,0,0,0.5)',
                animation: 'elevatorFloorIn .35s cubic-bezier(.15,0,.25,1) both',
              }}
            >
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '9px',
                color: '#607888',
                letterSpacing: '4px',
              }}>ÉTAGE</span>
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '34px',
                fontWeight: 900,
                lineHeight: 1,
                color: '#00A89D',
                textShadow: '0 0 16px rgba(0,168,157,0.7), 2px 3px 0 rgba(0,20,30,0.9)',
              }}>
                {String(currentLevel).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '9px',
                color: '#00A89D',
                letterSpacing: '2px',
                marginTop: '1px',
                opacity: 0.7,
              }}>{hudInfo.levelName || '\u00a0'}</span>
            </div>
          </div>
        )}

        {/* ── TIMER BAR (game canvas width only) ── */}
        {isPlaying && (
          <div style={{ flexShrink: 0, background: '#EBF0F5', fontFamily: "'Share Tech Mono', monospace" }}>
            {/* Formula row */}
            <div style={{ display: 'flex', alignItems: 'center', height: '26px', borderBottom: '1px solid #C0D0DE' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '100%', borderRight: '1px solid #C0D0DE', background: '#E0E8F0', flexShrink: 0 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#0047AB', fontStyle: 'italic', fontWeight: 700 }}>fx</span>
              </div>
              <span ref={timerFormulaRef} style={{ fontSize: '11px', color: '#0047AB', padding: '0 10px', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', flex: 1, display: 'none' }}>
                =DESTROY(DOSSIERS,SALAIRE)
              </span>
              <span ref={timerTextRef} style={{ fontSize: '12px', color: '#607888', padding: '0 10px', flexShrink: 0, fontWeight: 700 }}>90s</span>
            </div>
            {/* Depleting progress bar — thicker */}
            <div style={{ height: '18px', background: 'rgba(200,216,232,0.5)', position: 'relative', overflow: 'hidden' }}>
              <div ref={timerFillRef} style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #0047AB, #00A89D)', boxShadow: '0 0 8px rgba(0,168,157,0.5)', transition: 'background 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* ── HUD ROW: RTT + level + SALAIRE + mute ── */}
        {isPlaying && (
          <div style={{
            flexShrink: 0,
            background: '#0D1D2E',
            display: 'flex',
            alignItems: 'stretch',
            gap: '3px',
            minHeight: '80px',
          }}>
            {/* RTT cell */}
            <div style={{
              background: '#0A1520',
              border: '1px solid rgba(0,71,171,0.35)',
              borderTop: '3px solid #0047AB',
              padding: '8px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '10px',
                color: '#607888',
                letterSpacing: '3px',
              }}>RTT</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: i <= hudInfo.lives ? '#0047AB' : 'rgba(0,71,171,0.12)',
                    border: `2px solid ${i <= hudInfo.lives ? '#00A89D' : 'rgba(0,168,157,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: i <= hudInfo.lives ? '0 0 10px rgba(0,168,157,0.55)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{ fontSize: '14px', color: i <= hudInfo.lives ? '#fff' : '#2A3A4A' }}>★</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: level phrase */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
            }}>
              {showPhrase && (
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '11px',
                  color: '#607888',
                  letterSpacing: '1px',
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {hudInfo.phrase}
                </div>
              )}
            </div>

            {/* SALAIRE cell */}
            <div style={{
              background: '#0A1520',
              border: '1px solid rgba(0,71,171,0.35)',
              borderTop: '3px solid #D4A020',
              padding: '8px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '10px',
                color: '#607888',
                letterSpacing: '3px',
              }}>SALAIRE</span>
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '26px',
                fontWeight: 900,
                lineHeight: 1,
                color: '#FFD700',
                textShadow: '0 0 12px rgba(212,160,32,0.6)',
                letterSpacing: '1px',
              }}>
                {hudInfo.score.toLocaleString('fr-FR')}&nbsp;€
              </span>
            </div>

            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              className="pointer-events-auto cursor-pointer"
              style={{
                background: 'rgba(0,71,171,0.18)',
                padding: '0 14px',
                border: 'none',
                borderLeft: '1px solid rgba(0,71,171,0.3)',
                fontSize: '26px',
                color: isMuted ? '#FF5F56' : '#00A89D',
                flexShrink: 0,
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN: Tower (full height) with ad overlay ── */}
      {isPlaying && (
        <TowerProgress
          currentLevel={currentLevel}
          totalLevels={25}
          assets={assetsRef}
          isAdMode={isAdMode}
        />
      )}
    </div>
  );
}
