'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState, startGame, updateGame, renderGame } from '@/lib/gameEngine';
import { GameState } from '@/lib/gameTypes';
import GameOverScreen from './GameOverScreen';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameOver' | 'victory'>('idle');
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    resize();
    stateRef.current = createInitialState(canvas.width, canvas.height);
    const ctx = canvas.getContext('2d')!;
    renderGame(ctx, stateRef.current);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const loop = () => {
      if (!stateRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d')!;
      stateRef.current = updateGame(stateRef.current);

      if (stateRef.current.status === 'gameOver' || stateRef.current.status === 'victory') {
        setGameStatus(stateRef.current.status);
      }

      renderGame(ctx, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameStatus]);

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
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
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
    setGameStatus('playing');
  };

  const handleRestart = () => {
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setGameStatus('playing');
  };

  return (
    <div className="relative h-full w-full">
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
             style={{ background: 'rgba(10,26,18,0.7)', backdropFilter: 'blur(3px)' }}>
          <div className="text-center">
            <h1 style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '4px',
              textShadow: '0 0 20px rgba(60,179,113,0.5)',
            }}>
              GUIBUREAUCRACY
            </h1>
            <p style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '10px',
              color: '#3CB371',
              letterSpacing: '3px',
              marginTop: '8px',
            }}>
              SURVIVEZ AUX DOSSIERS VOLANTS DE L&apos;OPEN SPACE
            </p>
          </div>
          <button
            onClick={handlePlay}
            className="cursor-pointer transition-all hover:brightness-110 active:scale-95"
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '8px',
              color: '#fff',
              background: '#1A5C38',
              border: '2px solid #3CB371',
              padding: '16px 52px',
              boxShadow: '0 0 30px rgba(46,139,87,0.3)',
            }}
          >
            JOUER
          </button>
          <div className="text-center" style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: '#607888',
            letterSpacing: '1px',
          }}>
            <p>FLECHES / ZQSD POUR BOUGER — ESPACE POUR TIRER</p>
            <p style={{ marginTop: '4px' }}>MOBILE : GAUCHE/DROITE POUR BOUGER, CENTRE POUR TIRER</p>
          </div>
        </div>
      )}

      {/* Name modal — Excel style */}
      {showNameModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center"
             style={{ background: 'rgba(10,26,18,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-[440px] max-w-[90vw] overflow-hidden shadow-2xl"
               style={{
                 animation: 'slideUp 0.3s ease-out',
                 border: '2px solid #1A5C38',
                 background: '#fff',
               }}>
            {/* Title bar */}
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
                  GUIBOUR CORP. — EMBAUCHE
                </span>
              </div>
              <div className="flex gap-2 text-white/60" style={{ fontSize: '10px' }}>
                <span>—</span><span>□</span><span>✕</span>
              </div>
            </div>
            {/* Formula bar */}
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
                =EMBAUCHE(NOM_EMPLOYE)
              </span>
            </div>
            {/* Body */}
            <div className="p-6" style={{ background: '#F5F5F5' }}>
              <p style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '11px',
                color: '#607888',
                letterSpacing: '1px',
                marginBottom: '14px',
              }}>
                ENTREZ VOTRE NOM D&apos;EMPLOYE :
              </p>
              <input
                type="text"
                maxLength={16}
                autoFocus
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="Nom..."
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '14px',
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #C8D8E8',
                  background: '#fff',
                  color: '#0A1A12',
                  outline: 'none',
                  marginBottom: '14px',
                }}
              />
              <button
                onClick={handleStart}
                className="w-full cursor-pointer py-3 transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  color: '#fff',
                  background: '#1A5C38',
                  border: '1px solid #0A1A12',
                }}
              >
                COMMENCER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Victory overlay */}
      {(gameStatus === 'gameOver' || gameStatus === 'victory') && stateRef.current && (
        <GameOverScreen state={stateRef.current} onRestart={handleRestart} />
      )}
    </div>
  );
}
