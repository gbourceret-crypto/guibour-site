'use client';

import { useEffect, useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import { getLeaderboard, formatSalary } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/gameTypes';

function getRankTitle(rank: number): string {
  if (rank === 1) return 'DIRECTEUR GÉNÉRAL';
  if (rank === 2) return 'DIRECTEUR';
  if (rank === 3) return 'MANAGER';
  return 'EMPLOYÉ';
}

function getRankColor(rank: number): string {
  if (rank === 1) return '#FFE033';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return '#6ED47A';
}

export default function ResultatsPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0E1A0E' }}>
      <ExcelNav />
      <ExcelChrome formulaText={`=RANK(JOUEURS) // TOTAL_ENTRÉES: ${board.length}`}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Page title */}
          <div style={{ marginBottom: '32px' }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              color: '#3A8040',
              letterSpacing: '6px',
            }}>01 / CLASSEMENT</span>
            <h1 style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: '36px',
              color: '#7AEC7A',
              letterSpacing: '4px',
              marginTop: '6px',
              textShadow: '0 0 20px rgba(122,236,122,.35)',
            }}>RÉSULTATS</h1>
            <div style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, #7AEC7A, transparent)',
              marginTop: '6px',
            }} />
          </div>

          {/* Table */}
          <div style={{
            border: '1px solid #2A6040',
            background: '#0D1A0D',
            overflow: 'hidden',
          }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 160px 100px 130px',
              background: '#060E00',
              borderBottom: '2px solid #2A6040',
            }}>
              {['RANG', 'PSEUDO', 'TITRE', 'NIVEAU', 'SALAIRE'].map(col => (
                <div key={col} style={{
                  padding: '10px 12px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: '#3A8040',
                  letterSpacing: '2px',
                  borderRight: '1px solid #1B4332',
                }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Empty state */}
            {board.length === 0 && (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '11px',
                color: '#3A8040',
                letterSpacing: '2px',
              }}>
                AUCUN RÉSULTAT — JOUEZ POUR APPARAÎTRE ICI
              </div>
            )}

            {/* Data rows */}
            {board.map((entry, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 160px 100px 130px',
                background: i < 3 ? 'rgba(42,96,64,.25)' : i % 2 === 0 ? '#0D1A0D' : '#131E08',
                borderBottom: '1px solid #1B4332',
                borderLeft: i < 3 ? `3px solid ${getRankColor(i + 1)}` : '3px solid transparent',
              }}>
                <div style={{
                  padding: '12px 12px',
                  fontFamily: "'Luckiest Guy', cursive",
                  fontSize: '16px',
                  color: getRankColor(i + 1),
                  borderRight: '1px solid #1B4332',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {i + 1}
                </div>
                <div style={{
                  padding: '12px 12px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '12px',
                  color: '#C5EAC5',
                  borderRight: '1px solid #1B4332',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {entry.name}
                </div>
                <div style={{
                  padding: '12px 12px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px',
                  color: i < 3 ? getRankColor(i + 1) : '#6ED47A',
                  letterSpacing: '1px',
                  borderRight: '1px solid #1B4332',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {getRankTitle(i + 1)}
                </div>
                <div style={{
                  padding: '12px 12px',
                  fontFamily: "'Luckiest Guy', cursive",
                  fontSize: '16px',
                  color: '#7AEC7A',
                  borderRight: '1px solid #1B4332',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {entry.level}
                </div>
                <div style={{
                  padding: '12px 12px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FFE033',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {formatSalary(entry.score)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: '16px',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '7px',
            color: '#2A6040',
            letterSpacing: '2px',
          }}>
            =LAST_UPDATE() // CLASSEMENT LOCAL — DONNÉES SAUVEGARDÉES EN SESSION
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
