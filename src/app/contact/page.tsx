'use client';

import { useState, useEffect, useRef } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';

// ── Types ────────────────────────────────────────────────────────────────────
type Category = {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
};

const CATEGORIES: Category[] = [
  { id: 'incident',     icon: '⚙',  label: 'INCIDENT TECH',   sublabel: 'Panne / bug / cafetière HS',  color: '#FF6B35' },
  { id: 'rh',          icon: '📋', label: 'DEMANDE RH',       sublabel: 'Congés, RTT, télétravail',    color: '#5B9BD5' },
  { id: 'suggestion',  icon: '💡', label: 'SUGGESTION',       sublabel: 'Améliorer le système',        color: '#00FFEE' },
  { id: 'reclamation', icon: '⚠',  label: 'RÉCLAMATION',      sublabel: 'Tout ne va pas',              color: '#FFD700' },
  { id: 'felicitation',icon: '🎉', label: 'FÉLICITATION',     sublabel: 'Ça arrive parfois',           color: '#A8FF78' },
  { id: 'autre',       icon: '🤷', label: 'AUTRE',            sublabel: 'Inclassable',                 color: '#9B7FFF' },
];

// ── Step Pipeline ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, code: '01', label: 'IDENTIFICATION' },
  { id: 2, code: '02', label: 'CATÉGORIE'      },
  { id: 3, code: '03', label: 'MESSAGE'         },
  { id: 4, code: '04', label: 'ENVOI'           },
];

// ── Utility ──────────────────────────────────────────────────────────────────
function genRef() {
  return 'GS-' + Math.floor(10000 + Math.random() * 90000);
}

// ── Sub-components ───────────────────────────────────────────────────────────
function StepPipeline({ current }: { current: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '0 48px', height: '56px',
      background: 'rgba(0,0,0,.25)',
      borderBottom: '1px solid rgba(0,255,235,.08)',
      overflowX: 'auto',
    }}>
      {STEPS.map((s, i) => {
        const done    = s.id < current;
        const active  = s.id === current;
        const pending = s.id > current;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
            {/* Step node */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                background: done
                  ? 'rgba(0,255,235,.15)'
                  : active
                  ? 'rgba(0,71,171,.55)'
                  : 'rgba(0,0,0,.3)',
                border: `1px solid ${done ? 'rgba(0,255,235,.6)' : active ? '#5B9BD5' : 'rgba(255,255,255,.08)'}`,
                boxShadow: active ? '0 0 14px rgba(0,71,171,.5)' : 'none',
                transition: 'all .3s',
              }}>
                {done ? (
                  <span style={{ fontSize: '11px', color: '#00FFEE' }}>✓</span>
                ) : (
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '8px', fontWeight: 700,
                    color: active ? '#A8D8FF' : '#2A4060',
                  }}>{s.code}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '7px', letterSpacing: '3px',
                  color: done ? '#00FFEE' : active ? '#A8D8FF' : '#2A4060',
                  fontWeight: 700,
                  textShadow: active ? '0 0 8px rgba(0,71,171,.5)' : 'none',
                  transition: 'all .3s',
                  whiteSpace: 'nowrap',
                }}>{s.label}</span>
              </div>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 'clamp(20px, 4vw, 60px)', height: '1px', margin: '0 12px',
                background: done
                  ? 'linear-gradient(90deg, rgba(0,255,235,.6), rgba(0,255,235,.25))'
                  : 'rgba(255,255,255,.06)',
                transition: 'background .3s',
                flexShrink: 0,
              }} />
            )}
          </div>
        );
      })}

      {/* Ref number */}
      <div style={{ marginLeft: 'auto', paddingLeft: '24px', flexShrink: 0 }}>
        <span style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: '#1E3550', letterSpacing: '2px',
        }}>DOSSIER: GS-CONTACT // 2026</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [step, setStep]               = useState(1);
  const [name, setName]               = useState('');
  const [employeeId, setEmployeeId]   = useState('');
  const [category, setCategory]       = useState<string | null>(null);
  const [subject, setSubject]         = useState('');
  const [message, setMessage]         = useState('');
  const [sending, setSending]         = useState(false);
  const [sent, setSent]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [ref]                         = useState(genRef);
  const [animKey, setAnimKey]         = useState(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const msgRef  = useRef<HTMLTextAreaElement>(null);

  // Focus first field when step changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (step === 1) nameRef.current?.focus();
      if (step === 3) msgRef.current?.focus();
    }, 220);
    return () => clearTimeout(t);
  }, [step]);

  function goNext() {
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  }
  function goBack() {
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  }

  async function handleSend() {
    setSending(true);
    setError(null);
    const cat = CATEGORIES.find(c => c.id === category);
    const data = {
      name,
      email:   employeeId || 'non-renseigné',
      subject: `[${cat?.label ?? 'AUTRE'}] ${subject}`,
      message,
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Erreur serveur');
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  const selectedCat = CATEGORIES.find(c => c.id === category);

  // ── SENT confirmation ──────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="min-h-screen" style={{ background: '#0E2660' }}>
        <ExcelNav />
        <ExcelChrome formulaText={`=DOSSIER_TRANSMIS("${ref}") // ACCUSÉ_DE_RÉCEPTION`}>
          <div style={{
            minHeight: 'calc(100vh - 52px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, #061020 0%, #0E2660 100%)',
            backgroundImage: 'linear-gradient(rgba(0,255,235,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.03) 1px,transparent 1px)',
            backgroundSize: '56px 34px',
            padding: '40px 20px',
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px',
              maxWidth: '520px', width: '100%',
              animation: 'fadeSlideUp .5s ease both',
            }}>
              {/* Stamp */}
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                border: '3px solid #00FFEE',
                boxShadow: '0 0 40px rgba(0,255,235,.3), inset 0 0 24px rgba(0,255,235,.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px',
              }}>✓</div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Lilita One', cursive", fontSize: 'clamp(28px,5vw,42px)',
                  color: '#FFF', letterSpacing: '4px', lineHeight: 1,
                  textShadow: '0 0 24px rgba(0,255,235,.25), 1px 2px 0 rgba(0,0,0,.5)',
                }}>DOSSIER TRANSMIS</div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '9px',
                  color: '#00FFEE', letterSpacing: '5px', marginTop: '8px',
                  textShadow: '0 0 10px rgba(0,255,235,.6)',
                }}>ACCUSÉ DE RÉCEPTION AUTOMATIQUE</div>
              </div>

              {/* Dossier summary */}
              <div style={{
                width: '100%', padding: '24px 28px',
                background: 'rgba(0,255,235,.03)',
                border: '1px solid rgba(0,255,235,.18)',
                boxShadow: '0 0 20px rgba(0,255,235,.06)',
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                {[
                  { label: 'RÉFÉRENCE', value: ref },
                  { label: 'ÉMETTEUR',  value: name || '—' },
                  { label: 'CATÉGORIE', value: selectedCat?.label ?? '—' },
                  { label: 'OBJET',     value: subject || '—' },
                  { label: 'STATUT',    value: '● EN ATTENTE DE TRAITEMENT', glow: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#2A4060', letterSpacing: '3px', flexShrink: 0 }}>{row.label}</span>
                    <span style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '9px',
                      color: row.glow ? '#00FFEE' : '#8AB4CC',
                      textShadow: row.glow ? '0 0 8px rgba(0,255,235,.6)' : 'none',
                      textAlign: 'right',
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                color: '#2E6058', letterSpacing: '2px', textAlign: 'center', lineHeight: 1.8,
              }}>
                Votre dossier sera traité après la prochaine pause café.<br />
                Délai estimé : entre 3 et 47 jours ouvrés.
              </div>

              <button
                onClick={() => { setSent(false); setStep(1); setName(''); setEmployeeId(''); setCategory(null); setSubject(''); setMessage(''); setError(null); }}
                style={{
                  fontFamily: "'Lilita One', cursive", fontSize: '14px', letterSpacing: '3px',
                  color: '#fff', background: 'transparent',
                  border: '2px solid rgba(0,255,235,.3)', padding: '13px 36px',
                  cursor: 'pointer', boxShadow: '0 0 16px rgba(0,255,235,.1)',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FFEE'; e.currentTarget.style.color = '#00FFEE'; e.currentTarget.style.boxShadow = '0 0 28px rgba(0,255,235,.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,235,.3)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,235,.1)'; }}
              >
                NOUVEAU DOSSIER
              </button>
            </div>
          </div>
        </ExcelChrome>
        <style>{animStyles}</style>
      </div>
    );
  }

  // ── MAIN FORM ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#0E2660' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=TRANSMISSION_DOSSIER("GUIBOUR","RH") // W.O.W // 2026'>
        <div style={{
          minHeight: 'calc(100vh - 52px)',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #061020 0%, #0E2660 60%, #0A1E4A 100%)',
          backgroundImage: 'linear-gradient(rgba(0,255,235,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.03) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
        }}>

          {/* Pipeline header */}
          <StepPipeline current={step} />

          {/* Step content */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(24px, 4vw, 60px) clamp(16px, 4vw, 60px)',
          }}>
            <div
              key={animKey}
              style={{
                width: '100%', maxWidth: step === 2 ? '760px' : '600px',
                animation: 'fadeSlideUp .35s ease both',
              }}
            >

              {/* ── STEP 1 — Identification ── */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#00FFEE', letterSpacing: '6px', marginBottom: '10px',
                      textShadow: '0 0 8px rgba(0,255,235,.5)',
                    }}>ÉTAPE 01 — IDENTIFICATION</div>
                    <div style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: 'clamp(24px,4vw,38px)', color: '#FFF',
                      letterSpacing: '3px', lineHeight: 1,
                      textShadow: '1px 2px 0 rgba(0,0,0,.5)',
                    }}>DÉCLINEZ VOTRE IDENTITÉ</div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#2A4060', letterSpacing: '2px', marginTop: '8px',
                    }}>Toute transmission anonyme sera archivée sous "DOSSIER INCONNU"</div>
                  </div>

                  {/* Badge card */}
                  <div style={{
                    background: 'rgba(0,0,0,.35)',
                    border: '1px solid rgba(0,255,235,.12)',
                    padding: '32px 36px',
                    display: 'flex', flexDirection: 'column', gap: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,.3)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Corner marks */}
                    {['0 0', '0 auto', 'auto 0', 'auto auto'].map((m, i) => (
                      <div key={i} style={{
                        position: 'absolute', [i < 2 ? 'top' : 'bottom']: '12px',
                        [i % 2 === 0 ? 'left' : 'right']: '12px',
                        width: '12px', height: '12px',
                        borderTop: i < 2 ? '2px solid rgba(0,255,235,.25)' : 'none',
                        borderBottom: i >= 2 ? '2px solid rgba(0,255,235,.25)' : 'none',
                        borderLeft: i % 2 === 0 ? '2px solid rgba(0,255,235,.25)' : 'none',
                        borderRight: i % 2 !== 0 ? '2px solid rgba(0,255,235,.25)' : 'none',
                      }} />
                    ))}

                    <Field label="NOM / PSEUDO" required hint="Tel qu'il apparaîtra au classement">
                      <input
                        ref={nameRef}
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ex: LePatronDesBulles"
                        maxLength={30}
                        style={inputCss}
                        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) goNext(); }}
                      />
                    </Field>

                    <Field label="MATRICULE EMPLOYÉ" hint="Optionnel — pour retrouver votre dossier">
                      <input
                        type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                        placeholder="GS-XXXXXX (facultatif)"
                        maxLength={12}
                        style={inputCss}
                        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) goNext(); }}
                      />
                    </Field>
                  </div>

                  <NavButtons
                    onNext={goNext} canNext={name.trim().length > 0}
                    showBack={false} onBack={goBack}
                    nextLabel="SUIVANT →"
                  />
                </div>
              )}

              {/* ── STEP 2 — Catégorie ── */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#00FFEE', letterSpacing: '6px', marginBottom: '10px',
                      textShadow: '0 0 8px rgba(0,255,235,.5)',
                    }}>ÉTAPE 02 — CATÉGORIE</div>
                    <div style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: 'clamp(22px,3.5vw,34px)', color: '#FFF',
                      letterSpacing: '3px', lineHeight: 1,
                      textShadow: '1px 2px 0 rgba(0,0,0,.5)',
                    }}>SÉLECTIONNEZ LE SERVICE COMPÉTENT</div>
                  </div>

                  {/* Category grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                  }}>
                    {CATEGORIES.map(cat => {
                      const sel = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          style={{
                            background: sel
                              ? `rgba(${hexToRgb(cat.color)},.12)`
                              : 'rgba(0,0,0,.3)',
                            border: `2px solid ${sel ? cat.color : 'rgba(255,255,255,.07)'}`,
                            padding: '18px 16px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '14px',
                            textAlign: 'left',
                            transition: 'all .18s ease',
                            boxShadow: sel ? `0 0 20px rgba(${hexToRgb(cat.color)},.2)` : 'none',
                          }}
                          onMouseEnter={e => {
                            if (!sel) {
                              e.currentTarget.style.border = `2px solid rgba(${hexToRgb(cat.color)},.45)`;
                              e.currentTarget.style.background = `rgba(${hexToRgb(cat.color)},.06)`;
                            }
                          }}
                          onMouseLeave={e => {
                            if (!sel) {
                              e.currentTarget.style.border = '2px solid rgba(255,255,255,.07)';
                              e.currentTarget.style.background = 'rgba(0,0,0,.3)';
                            }
                          }}
                        >
                          <span style={{ fontSize: '24px', flexShrink: 0, lineHeight: 1 }}>{cat.icon}</span>
                          <div>
                            <div style={{
                              fontFamily: "'Lilita One', cursive", fontSize: '13px', letterSpacing: '2px',
                              color: sel ? cat.color : '#8AB4CC',
                              textShadow: sel ? `0 0 10px rgba(${hexToRgb(cat.color)},.5)` : 'none',
                              transition: 'all .18s',
                            }}>{cat.label}</div>
                            <div style={{
                              fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                              color: sel ? 'rgba(255,255,255,.45)' : '#2A4060',
                              marginTop: '3px', letterSpacing: '1px',
                            }}>{cat.sublabel}</div>
                          </div>
                          {sel && (
                            <div style={{
                              marginLeft: 'auto', width: '18px', height: '18px',
                              borderRadius: '50%', background: cat.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '9px', color: '#000', fontWeight: 700, flexShrink: 0,
                              boxShadow: `0 0 10px rgba(${hexToRgb(cat.color)},.6)`,
                            }}>✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Subject */}
                  {category && (
                    <div style={{
                      animation: 'fadeSlideUp .3s ease both',
                      background: 'rgba(0,0,0,.28)',
                      border: '1px solid rgba(0,255,235,.1)',
                      padding: '20px 24px',
                    }}>
                      <Field label="OBJET DE LA DEMANDE" required>
                        <input
                          type="text" value={subject} onChange={e => setSubject(e.target.value)}
                          placeholder="Résumez en quelques mots..."
                          maxLength={80}
                          style={inputCss}
                          onKeyDown={e => { if (e.key === 'Enter' && subject.trim()) goNext(); }}
                          autoFocus
                        />
                      </Field>
                    </div>
                  )}

                  <NavButtons
                    onNext={goNext} canNext={!!category && subject.trim().length > 0}
                    showBack onBack={goBack}
                    nextLabel="SUIVANT →"
                  />
                </div>
              )}

              {/* ── STEP 3 — Message ── */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#00FFEE', letterSpacing: '6px', marginBottom: '10px',
                      textShadow: '0 0 8px rgba(0,255,235,.5)',
                    }}>ÉTAPE 03 — MESSAGE</div>
                    <div style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: 'clamp(22px,3.5vw,34px)', color: '#FFF',
                      letterSpacing: '3px', lineHeight: 1,
                      textShadow: '1px 2px 0 rgba(0,0,0,.5)',
                    }}>RÉDIGEZ VOTRE TRANSMISSION</div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#2A4060', letterSpacing: '2px', marginTop: '8px',
                    }}>Soyez concis. La direction a peu de temps entre deux réunions.</div>
                  </div>

                  {/* Memo card */}
                  <div style={{
                    background: 'rgba(0,0,0,.3)',
                    border: '1px solid rgba(0,255,235,.12)',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,.3)',
                  }}>
                    {/* Memo header */}
                    <div style={{
                      background: 'rgba(0,255,235,.04)',
                      borderBottom: '1px solid rgba(0,255,235,.1)',
                      padding: '14px 24px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                    }}>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        {[
                          { l: 'DE', v: name || '—' },
                          { l: 'À',  v: selectedCat ? `SERVICE ${selectedCat.label}` : '—' },
                        ].map(r => (
                          <div key={r.l} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#2A4060', letterSpacing: '2px' }}>{r.l}:</span>
                            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#8AB4CC' }}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3550', letterSpacing: '2px' }}>
                        REF: {ref}
                      </div>
                    </div>

                    {/* Textarea */}
                    <div style={{ padding: '24px' }}>
                      <textarea
                        ref={msgRef}
                        value={message} onChange={e => setMessage(e.target.value)}
                        rows={8}
                        placeholder="Votre message ici..."
                        style={{
                          ...inputCss,
                          resize: 'none',
                          lineHeight: 1.8,
                          width: '100%',
                          boxSizing: 'border-box',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '12px',
                        }}
                      />
                      <div style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                        color: message.length > 500 ? '#FF6B35' : '#1E3550',
                        letterSpacing: '1px', textAlign: 'right', marginTop: '6px',
                        transition: 'color .2s',
                      }}>
                        {message.length}/1000 CARACTÈRES
                      </div>
                    </div>
                  </div>

                  <NavButtons
                    onNext={goNext} canNext={message.trim().length > 0}
                    showBack onBack={goBack}
                    nextLabel="VÉRIFIER →"
                  />
                </div>
              )}

              {/* ── STEP 4 — Review + Send ── */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#00FFEE', letterSpacing: '6px', marginBottom: '10px',
                      textShadow: '0 0 8px rgba(0,255,235,.5)',
                    }}>ÉTAPE 04 — TRANSMISSION</div>
                    <div style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: 'clamp(22px,3.5vw,34px)', color: '#FFF',
                      letterSpacing: '3px', lineHeight: 1,
                      textShadow: '1px 2px 0 rgba(0,0,0,.5)',
                    }}>VÉRIFICATION DU DOSSIER</div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#2A4060', letterSpacing: '2px', marginTop: '8px',
                    }}>Une fois transmis, votre dossier sera irrémédiablement perdu dans la bureaucratie.</div>
                  </div>

                  {/* Dossier preview */}
                  <div style={{
                    background: 'rgba(0,0,0,.35)',
                    border: '1px solid rgba(0,255,235,.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,.3)',
                    overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{
                      background: 'rgba(0,255,235,.04)',
                      borderBottom: '1px solid rgba(0,255,235,.1)',
                      padding: '16px 28px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div style={{
                        fontFamily: "'Lilita One', cursive", fontSize: '14px',
                        color: '#FFF', letterSpacing: '3px',
                        textShadow: '1px 2px 0 rgba(0,0,0,.5)',
                      }}>DOSSIER {ref}</div>
                      {selectedCat && (
                        <div style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: '9px',
                          color: selectedCat.color, letterSpacing: '2px',
                          padding: '4px 10px',
                          border: `1px solid ${selectedCat.color}55`,
                          background: `rgba(${hexToRgb(selectedCat.color)},.08)`,
                          textShadow: `0 0 8px rgba(${hexToRgb(selectedCat.color)},.5)`,
                        }}>{selectedCat.icon} {selectedCat.label}</div>
                      )}
                    </div>

                    {/* Info rows */}
                    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'ÉMETTEUR',  value: name },
                        { label: 'MATRICULE', value: employeeId || '(non renseigné)' },
                        { label: 'OBJET',     value: subject },
                      ].map(row => (
                        <div key={row.label} style={{
                          display: 'flex', gap: '16px', alignItems: 'baseline',
                          borderBottom: '1px solid rgba(0,255,235,.04)', paddingBottom: '10px',
                        }}>
                          <span style={{
                            fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                            color: '#2A4060', letterSpacing: '3px', flexShrink: 0, width: '80px',
                          }}>{row.label}</span>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#8AB4CC' }}>{row.value}</span>
                        </div>
                      ))}

                      {/* Message */}
                      <div>
                        <div style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                          color: '#2A4060', letterSpacing: '3px', marginBottom: '8px',
                        }}>MESSAGE</div>
                        <div style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
                          color: '#7AA0BE', lineHeight: 1.8,
                          maxHeight: '140px', overflowY: 'auto',
                          paddingRight: '4px',
                        }}>{message}</div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#FF4444',
                      letterSpacing: '1px', padding: '12px 16px',
                      background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.3)',
                    }}>⚠ {error}</div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <button
                      onClick={goBack}
                      style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '3px',
                        color: '#3C5A7A', background: 'transparent',
                        border: '1px solid rgba(255,255,255,.08)', padding: '12px 24px',
                        cursor: 'pointer', transition: 'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#8AB4CC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#3C5A7A'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; }}
                    >← MODIFIER</button>

                    <button
                      onClick={handleSend}
                      disabled={sending}
                      style={{
                        fontFamily: "'Lilita One', cursive", fontSize: '18px', letterSpacing: '4px',
                        color: sending ? 'rgba(255,255,255,.4)' : '#fff',
                        background: sending
                          ? 'rgba(0,71,171,.2)'
                          : 'linear-gradient(135deg, #0047AB, #007B8A)',
                        border: `2px solid ${sending ? 'rgba(91,155,213,.2)' : '#5B9BD5'}`,
                        padding: '16px 52px',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        boxShadow: sending ? 'none' : '0 0 26px rgba(0,71,171,.35)',
                        transition: 'all .25s ease',
                        textShadow: sending ? 'none' : '1px 2px 0 rgba(0,0,0,.5)',
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        if (!sending) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)';
                          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,71,171,.55)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!sending) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)';
                          e.currentTarget.style.boxShadow = '0 0 26px rgba(0,71,171,.35)';
                        }
                      }}
                    >
                      {sending ? 'TRANSMISSION...' : 'TRANSMETTRE LE DOSSIER →'}
                      {!sending && (
                        <span style={{
                          position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)',
                          animation: 'shimmer 3s ease-in-out infinite',
                        }} />
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </ExcelChrome>
      <style>{animStyles}</style>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <label style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: '#00FFEE', letterSpacing: '4px', opacity: 0.7,
        }}>{label}{required && <span style={{ color: '#FF6B35', marginLeft: '4px' }}>*</span>}</label>
        {hint && <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3550', letterSpacing: '1px' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function NavButtons({ onNext, canNext, showBack, onBack, nextLabel }: {
  onNext: () => void; canNext: boolean;
  showBack: boolean; onBack: () => void;
  nextLabel: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: showBack ? 'space-between' : 'flex-end', alignItems: 'center', gap: '16px' }}>
      {showBack && (
        <button
          onClick={onBack}
          style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '3px',
            color: '#3C5A7A', background: 'transparent',
            border: '1px solid rgba(255,255,255,.08)', padding: '12px 24px',
            cursor: 'pointer', transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#8AB4CC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3C5A7A'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; }}
        >← RETOUR</button>
      )}
      <button
        onClick={onNext}
        disabled={!canNext}
        style={{
          fontFamily: "'Lilita One', cursive", fontSize: '16px', letterSpacing: '4px',
          color: canNext ? '#fff' : 'rgba(255,255,255,.2)',
          background: canNext
            ? 'linear-gradient(135deg, #0047AB, #007B8A)'
            : 'rgba(0,0,0,.2)',
          border: `2px solid ${canNext ? '#5B9BD5' : 'rgba(255,255,255,.06)'}`,
          padding: '14px 44px',
          cursor: canNext ? 'pointer' : 'not-allowed',
          boxShadow: canNext ? '0 0 22px rgba(0,71,171,.3)' : 'none',
          transition: 'all .25s ease',
          textShadow: canNext ? '1px 2px 0 rgba(0,0,0,.5)' : 'none',
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={e => {
          if (canNext) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)';
            e.currentTarget.style.boxShadow = '0 0 36px rgba(0,71,171,.5)';
          }
        }}
        onMouseLeave={e => {
          if (canNext) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)';
            e.currentTarget.style.boxShadow = '0 0 22px rgba(0,71,171,.3)';
          }
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCss: React.CSSProperties = {
  width: '100%', border: 'none',
  background: 'transparent',
  borderBottom: '1px solid rgba(0,255,235,.2)',
  fontFamily: "'Orbitron', sans-serif", fontSize: '13px',
  color: '#E0F0FF', outline: 'none',
  padding: '8px 2px',
  boxSizing: 'border-box',
  transition: 'border-color .2s',
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const animStyles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { left: -100%; }
    60%  { left: 150%; }
    100% { left: 150%; }
  }
  ::placeholder { color: rgba(80,130,160,.3) !important; }
  input, textarea { caret-color: #00FFEE; }
  input:focus, textarea:focus { border-bottom-color: rgba(0,255,235,.6) !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,255,235,.2); border-radius: 2px; }
`;
