'use client';

import React from 'react';
import { GameState } from '@/lib/gameTypes';
import { addScore, formatDuration, formatSalary, getShareText } from '@/lib/leaderboard';
import { useEffect, useState, useRef } from 'react';
import { PlayerIdentity } from '@/components/ui/CharacterSelect';
import { playClick } from '@/lib/sounds';

interface Props {
  state: GameState;
  onRestart: () => void;
  playerIdentity?: PlayerIdentity | null;
  replayUrl?: string | null;
}

// ── WhatsApp share RTT tracker ────────────────────────────────────────────────
const WA_SHARE_KEY = 'guibour-wa-shares';
function getWaShares(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(WA_SHARE_KEY) ?? '0', 10);
}
function incWaShares(): number {
  const n = Math.min(getWaShares() + 1, 3);
  localStorage.setItem(WA_SHARE_KEY, String(n));
  return n;
}

// ── Instagram share image via Canvas ────────────────────────────────────────
function generateShareImage(pseudo: string, level: number, score: number): string {
  const w = 1080, h = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0C2A62');
  grad.addColorStop(0.6, '#1A3F78');
  grad.addColorStop(1, '#264D82');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(0,120,220,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 56) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.strokeStyle = '#00C8BE';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, w - 40, h - 40);
  ctx.strokeStyle = 'rgba(0,200,190,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, w - 64, h - 64);
  ctx.fillStyle = '#0047AB';
  ctx.fillRect(20, 20, w - 40, 60);
  ctx.fillStyle = '#A8D8FF';
  ctx.font = 'bold 22px Orbitron, monospace';
  ctx.fillText('GUIBOUR SYSTEM // W.O.W // 2026', 48, 58);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 110px Arial Black';
  ctx.textAlign = 'center';
  ctx.fillText('GUIBOUR', w / 2, 220);
  ctx.fillStyle = '#00D4CC';
  ctx.font = 'bold 36px Orbitron, monospace';
  ctx.fillText('SYSTEM', w / 2, 270);
  ctx.fillStyle = '#00C8BE';
  ctx.fillRect(100, 295, w - 200, 3);
  ctx.fillStyle = '#5B9BD5';
  ctx.font = '20px monospace';
  ctx.fillText('EMPLOYÉ', w / 2, 340);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(pseudo.toUpperCase(), w / 2, 440);
  const stats = [
    { label: 'ÉTAGE ATTEINT', value: String(level).padStart(2, '0') + ' / 25', color: '#FFE033' },
    { label: 'SALAIRE CUMULÉ', value: formatSalary(score), color: '#00C8BE' },
    { label: 'STATUT', value: level >= 25 ? 'LIBÉRÉ ✓' : 'CAREER FAILED', color: level >= 25 ? '#27C93F' : '#FF4444' },
  ];
  stats.forEach((stat, i) => {
    const x = 100 + i * 296;
    const y = 500;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x, y, 276, 130);
    ctx.strokeStyle = stat.color + '60';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 276, 130);
    ctx.fillStyle = '#5B9BD5';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stat.label, x + 138, y + 30);
    ctx.fillStyle = stat.color;
    ctx.font = 'bold 34px monospace';
    ctx.fillText(stat.value, x + 138, y + 90);
  });
  ctx.fillStyle = '#0047AB';
  ctx.fillRect(200, 680, w - 400, 80);
  ctx.strokeStyle = '#00C8BE';
  ctx.lineWidth = 2;
  ctx.strokeRect(200, 680, w - 400, 80);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('JOUE SUR GUIBOUR.FR', w / 2, 728);
  ctx.fillStyle = '#00C8BE';
  ctx.fillRect(20, h - 80, w - 40, 60);
  ctx.fillStyle = '#0C2A62';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('GUIBOUR.FR // W.O.W // #GUIBOUR2026', w / 2, h - 42);
  return canvas.toDataURL('image/png');
}

function GameOverScreen({ state, onRestart, playerIdentity, replayUrl }: Props) {
  const { player, level, status } = state;
  const isVictory = status === 'victory';
  const [rank, setRank] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showRTTPanel, setShowRTTPanel] = useState(false);
  const [waShareCount, setWaShareCount] = useState(0);
  const [emailGiven, setEmailGiven] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const canvasGenerated = useRef(false);

  const durationMs = state.endTime && state.startTime ? state.endTime - state.startTime : 0;
  const durationText = formatDuration(durationMs);
  const pseudo = playerIdentity?.pseudo || player.name || 'EMPLOYÉ';

  useEffect(() => {
    if (!saved) {
      setSaved(true);
      const r = addScore({ name: pseudo, score: player.score, level, date: new Date().toISOString() });
      setRank(r);
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pseudo,
          score: player.score,
          level,
          employeeId: playerIdentity?.employeeId || `GS-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        }),
      }).then(res => res.json()).then(d => { if (d.rank) setRank(d.rank); }).catch(() => {});
      fetch('/api/players', { method: 'POST' }).catch(() => {});
    }
  }, [saved, pseudo, player, level, playerIdentity]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 2500);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!isVictory && showContent) {
      const t = setTimeout(() => {
        setShowRTTPanel(true);
        setWaShareCount(getWaShares());
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isVictory, showContent]);

  useEffect(() => {
    if (showContent && !canvasGenerated.current) {
      canvasGenerated.current = true;
      try {
        const url = generateShareImage(pseudo, level, player.score);
        setShareImageUrl(url);
      } catch (_) {}
    }
  }, [showContent, pseudo, level, player.score]);

  useEffect(() => {
    if (playerIdentity) setEmailGiven(!!(playerIdentity.email));
  }, [playerIdentity]);

  const handleDownloadCertificate = async () => {
    playClick();
    const { generateCertificate } = await import('@/lib/generateCertificate');
    await generateCertificate({
      pseudo,
      employeeId: playerIdentity?.employeeId || 'GS-000000',
      level,
      score: player.score,
      rank: rank > 0 ? rank : undefined,
    });
  };

  const handleShare = async () => {
    playClick();
    const text = getShareText(pseudo, level, player.score, durationMs);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    playClick();
    await navigator.clipboard.writeText('https://guibour.fr');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsAppInvite = () => {
    playClick();
    const text = encodeURIComponent(
      `🎮 Viens jouer à W.O.W (Work Or Window) !\n` +
      `Survive aux dossiers volants et monte jusqu'au 25e étage !\n` +
      `👉 guibour.fr`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    playClick();
    if (waShareCount >= 3) return;
    const text = encodeURIComponent(
      `🎮 J'ai joué à W.O.W (Work Or Window) de Guibour !\n` +
      `Étage ${level}/25 | ${formatSalary(player.score)} de salaire\n` +
      `Bats mon score → guibour.fr`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    const newCount = incWaShares();
    setWaShareCount(newCount);
  };

  const handleInstagramShare = () => {
    playClick();
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `guibour-wow-${pseudo.toLowerCase()}-lvl${level}.png`;
    link.click();
    setTimeout(() => { window.open('https://www.instagram.com/', '_blank'); }, 500);
  };

  const handleDownloadImage = () => {
    playClick();
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `guibour-wow-score.png`;
    link.click();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
      style={{
        background: isVictory ? 'rgba(0,8,20,0.88)' : 'rgba(8,2,2,0.90)',
        backdropFilter: 'blur(5px)',
        overflowY: 'auto',
        padding: '16px 0',
      }}>

      {/* ── BIG SLAM TEXT ── */}
      <div className="mb-5 text-center" style={{ pointerEvents: 'none', flexShrink: 0 }}>
        <h1 style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: isVictory ? 'clamp(56px, 10vw, 100px)' : 'clamp(50px, 9vw, 94px)',
          color: isVictory ? '#00FFEE' : '#FF2020',
          letterSpacing: isVictory ? '8px' : '4px',
          lineHeight: 0.9, display: 'block',
          textShadow: isVictory
            ? '3px 4px 0 #002A28, 6px 8px 0 rgba(0,30,28,.7), 9px 12px 0 rgba(0,0,0,.4), 0 0 40px rgba(0,255,235,.7)'
            : '3px 4px 0 #2A0000, 6px 8px 0 rgba(40,0,0,.7), 9px 12px 0 rgba(0,0,0,.4), 0 0 40px rgba(255,30,30,.7)',
          animation: isVictory
            ? 'victorySlam 0.7s cubic-bezier(.15,0,.25,1) both, victoryGlow 2s ease-in-out infinite 0.8s'
            : 'scareSlam 0.7s cubic-bezier(.15,0,.25,1) both, scareGlow 2s ease-in-out infinite 0.8s',
        }}>
          {isVictory ? 'VOUS ÊTES\nLIBRE' : 'CAREER\nFAILED'}
        </h1>
        {!isVictory && (
          <p style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: 'clamp(26px, 4.5vw, 54px)',
            color: '#FF5050', letterSpacing: '5px', marginTop: '8px', display: 'block',
            textShadow: '2px 3px 0 #2A0000, 4px 6px 0 rgba(40,0,0,.6), 0 0 20px rgba(255,60,60,.5)',
            animation: 'scareSlam 0.7s cubic-bezier(.15,0,.25,1) 0.2s both, scarePulse 1.8s ease-in-out infinite 0.9s',
          }}>
            TU ES UN LOOSER
          </p>
        )}
        {isVictory && (
          <p style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(11px, 1.8vw, 16px)',
            color: '#00C8BE', letterSpacing: '5px', marginTop: '16px', opacity: 0.8,
            animation: 'fadeIn 0.6s ease 0.9s both',
          }}>
            25 ÉTAGES — MISSION ACCOMPLIE
          </p>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      {showContent && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 12px 12px', width: '100%', maxWidth: '900px' }}>

          {/* ── LEFT: STATS + ACTIONS ── */}
          <div style={{
            width: '360px', maxWidth: '92vw',
            background: '#0C1E40',
            border: '2px solid #0047AB',
            animation: 'slideUp 0.4s ease-out',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {/* Title bar */}
            <div style={{ background: '#0047AB', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F56', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#27C93F', display: 'inline-block' }} />
              </div>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#fff', letterSpacing: '2px' }}>
                {isVictory ? 'LIBERTÉ OBTENUE' : 'DOSSIER CLASSÉ'}
              </span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,.4)' }}>✕</span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Employee */}
              <div style={{ textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid #1A3E7A' }}>
                <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '22px', color: '#FFFFFF', letterSpacing: '4px' }}>{pseudo}</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '3px' }}>EMPLOYÉ(E) DU MOIS</div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'ÉTAGE', value: `${String(level).padStart(2,'0')}/25`, color: '#FFE033' },
                  { label: 'SALAIRE', value: formatSalary(player.score), color: '#00C8BE' },
                  { label: 'RANG', value: rank > 0 ? `#${rank}` : '—', color: '#FF7744' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#3C5A7A', letterSpacing: '2px', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '15px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Duration */}
              <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '2px' }}>DURÉE</span>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#A8D8FF', fontWeight: 700 }}>{durationText}</span>
              </div>

              {/* ── PRIMARY ACTION: REJOUER ── */}
              <button
                onClick={() => { playClick(); onRestart(); }}
                style={{
                  width: '100%',
                  fontFamily: "'Luckiest Guy', cursive",
                  fontSize: '22px',
                  letterSpacing: '4px',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #0047AB, #007B8A)',
                  border: '2px solid #00C8BE',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0,200,190,.3)',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(0,200,190,.55)'; e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,190,.3)'; e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)'; }}
              >
                ↺ REJOUER
              </button>

              {/* Secondary actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleShare}
                  style={{ flex: 1, padding: '10px 8px', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '1px', color: '#A8D8FF', background: '#091E4A', border: '1px solid #1A3E7A', cursor: 'pointer' }}
                >
                  {copied ? '✓ COPIÉ' : '↗ PARTAGER'}
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  title="Certificat PDF"
                  style={{ padding: '10px 14px', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', color: '#FFE033', background: '#091E4A', border: '1px solid #3A2A00', cursor: 'pointer' }}
                >
                  📜
                </button>
              </div>

              {/* Replay */}
              {replayUrl && (
                <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00C8BE', letterSpacing: '1px' }}>🎬 REPLAY</span>
                  <a href={replayUrl} download={`wow-replay-${pseudo}.webm`} style={{ marginLeft: 'auto', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', padding: '5px 10px', background: 'rgba(0,200,190,.12)', color: '#00C8BE', border: '1px solid #1A3E7A', textDecoration: 'none', borderRadius: '2px' }}>↓ DL</a>
                </div>
              )}

              {/* RTT bonus */}
              {showRTTPanel && !isVictory && !emailGiven && (
                <div style={{ background: '#1A1000', border: '1px solid #3A2A00', padding: '10px 12px' }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#FFE033', letterSpacing: '2px', marginBottom: '6px' }}>💼 +1 RTT — LAISSE TON EMAIL</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="email" placeholder="ton@email.com" id="rtt-email-input"
                      style={{ flex: 1, padding: '6px 8px', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', background: '#091E4A', color: '#fff', border: '1px solid #1A3E7A', outline: 'none' }} />
                    <button onClick={() => {
                      playClick();
                      const input = document.getElementById('rtt-email-input') as HTMLInputElement;
                      if (input?.value?.includes('@')) {
                        const stored = localStorage.getItem('guibour-identity');
                        if (stored) { const id = JSON.parse(stored); id.email = input.value; id.bonusRTT = (id.bonusRTT ?? 0) + 1; localStorage.setItem('guibour-identity', JSON.stringify(id)); }
                        fetch('/api/email-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: input.value, pseudo, source: 'rtt-bonus' }) }).catch(() => {});
                        setEmailGiven(true);
                      }
                    }} style={{ padding: '6px 12px', background: '#FFE033', color: '#0A1520', border: 'none', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', fontWeight: 700 }}>OK</button>
                  </div>
                </div>
              )}
              {emailGiven && !isVictory && (
                <div style={{ textAlign: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00C8BE', padding: '6px', border: '1px solid rgba(0,200,190,.2)' }}>✓ EMAIL ENREGISTRÉ — +1 RTT AU PROCHAIN RUN</div>
              )}
            </div>

            <div style={{ background: '#0047AB', padding: '5px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>guibour.fr</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>#WOW2026</span>
            </div>
          </div>

          {/* ── RIGHT: SHARE + INVITE ── */}
          <div style={{
            width: '300px', maxWidth: '92vw',
            display: 'flex', flexDirection: 'column', gap: '10px',
            animation: 'slideUp 0.4s ease-out 0.1s both',
            flexShrink: 0,
          }}>

            {/* INVITE FRIENDS — prominent section */}
            <div style={{
              background: '#0C1E40',
              border: '2px solid #00C8BE',
              overflow: 'hidden',
            }}>
              <div style={{ background: 'linear-gradient(135deg, #005050, #007B8A)', padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '16px', color: '#fff', letterSpacing: '3px' }}>
                  INVITE TES AMIS !
                </div>
              </div>
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                  Défie tes amis à survivre<br/>aux 25 étages de W.O.W !
                </p>
                {/* WhatsApp Invite */}
                <button
                  onClick={handleWhatsAppInvite}
                  style={{
                    width: '100%', padding: '12px',
                    fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '2px',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #1DAA61, #128C7E)',
                    border: '1px solid #25D366',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>💬</span> INVITER SUR WHATSAPP
                </button>
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  style={{
                    width: '100%', padding: '10px',
                    fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '2px',
                    color: linkCopied ? '#00C8BE' : '#A8D8FF',
                    background: '#091E4A',
                    border: `1px solid ${linkCopied ? '#00C8BE' : '#1A3E7A'}`,
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  {linkCopied ? '✓ LIEN COPIÉ !' : '🔗 COPIER GUIBOUR.FR'}
                </button>
              </div>
            </div>

            {/* PARTAGER MON SCORE */}
            <div style={{
              background: '#0C1E40',
              border: '2px solid #0047AB',
              overflow: 'hidden',
            }}>
              <div style={{ background: '#0047AB', padding: '7px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#A8D8FF', letterSpacing: '3px' }}>
                  PARTAGER MON SCORE
                </div>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Share image preview */}
                {shareImageUrl && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <img src={shareImageUrl} alt="Score" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #1A3E7A' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button
                        onClick={handleWhatsAppShare}
                        disabled={waShareCount >= 3}
                        style={{
                          width: '100%', padding: '7px',
                          fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                          background: waShareCount >= 3 ? '#1A3E7A' : 'linear-gradient(135deg, #1DAA61, #128C7E)',
                          color: '#fff', border: 'none', cursor: waShareCount >= 3 ? 'not-allowed' : 'pointer',
                          opacity: waShareCount >= 3 ? 0.5 : 1,
                        }}
                      >
                        💬 WA ({waShareCount}/3)
                      </button>
                      <button
                        onClick={handleInstagramShare}
                        style={{
                          width: '100%', padding: '7px',
                          fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                          background: shareImageUrl ? 'linear-gradient(135deg, #C13584, #E1306C)' : '#1A3E7A',
                          color: '#fff', border: 'none', cursor: 'pointer',
                        }}
                      >
                        📸 INSTA
                      </button>
                    </div>
                    <button
                      onClick={handleDownloadImage}
                      style={{ padding: '10px 8px', background: 'transparent', color: '#5B9BD5', border: '1px solid #1A3E7A', cursor: 'pointer', fontSize: '14px', alignSelf: 'stretch' }}
                    >↓</button>
                  </div>
                )}
                <button
                  onClick={handleShare}
                  style={{
                    width: '100%', padding: '10px',
                    fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '2px',
                    color: '#A8D8FF', background: '#091E4A', border: '1px solid #1A3E7A', cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ TEXTE COPIÉ !' : '↗ PARTAGER MON RÉSULTAT'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(GameOverScreen);
