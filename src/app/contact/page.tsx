'use client';

import { useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import Sphere from '@/components/ui/Sphere';

const contactInfo = [
  { label: 'EMAIL', value: 'contact@guibour.fr' },
  { label: 'SITE', value: 'guibour.fr' },
  { label: 'STATUS', value: 'SYSTÈME OPÉRATIONNEL' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0E1A0E' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CONTACT("GUIBOUR_CORP") // FORMULAIRE_INTERNE'>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Page title */}
          <div style={{ marginBottom: '36px' }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              color: '#3A8040',
              letterSpacing: '6px',
            }}>03 / CONTACT</span>
            <h1 style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: '36px',
              color: '#7AEC7A',
              letterSpacing: '4px',
              marginTop: '6px',
              textShadow: '0 0 20px rgba(122,236,122,.35)',
            }}>NOUS CONTACTER</h1>
            <div style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, #7AEC7A, transparent)',
              marginTop: '6px',
            }} />
          </div>

          {/* Two-column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: '1px',
            background: '#2A6040',
            border: '1px solid #2A6040',
          }}>

            {/* LEFT — Info panel */}
            <div style={{
              background: '#131E08',
              padding: '40px 32px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle grid overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(61,128,64,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,128,64,.06) 1px, transparent 1px)',
                backgroundSize: '52px 32px',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginBottom: '40px',
                }}>
                  <Sphere size={44} />
                  <div>
                    <div style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: '18px',
                      color: '#7AEC7A',
                      letterSpacing: '3px',
                      lineHeight: 1,
                    }}>GUIBOUR</div>
                    <div style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: '11px',
                      color: '#FFE033',
                      letterSpacing: '4px',
                    }}>SYSTEM</div>
                  </div>
                </div>

                {/* Contact info blocks */}
                {contactInfo.map(info => (
                  <div key={info.label} style={{
                    borderLeft: '2px solid #2A6040',
                    paddingLeft: '16px',
                    marginBottom: '24px',
                  }}>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '7px',
                      color: '#3A8040',
                      letterSpacing: '4px',
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      {info.label}
                    </span>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '12px',
                      color: '#6ED47A',
                      letterSpacing: '1px',
                    }}>
                      {info.value}
                    </span>
                  </div>
                ))}

                {/* Footer */}
                <div style={{
                  marginTop: '40px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '7px',
                  color: '#2A6040',
                  letterSpacing: '2px',
                  lineHeight: '1.8',
                }}>
                  GUIBOUR CORP. — DOCUMENT INTERNE<br />
                  REF: GS-CONTACT-001<br />
                  © 2026 GUIBOUR SYSTEM
                </div>
              </div>
            </div>

            {/* RIGHT — Form panel */}
            <div style={{
              background: '#1A3018',
              padding: '40px 36px',
            }}>
              {sent ? (
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                  <div style={{
                    fontFamily: "'Lilita One', cursive",
                    fontSize: '28px',
                    color: '#7AEC7A',
                    letterSpacing: '3px',
                    textShadow: '0 0 16px rgba(122,236,122,.4)',
                    marginBottom: '12px',
                  }}>
                    MESSAGE ENVOYÉ
                  </div>
                  <p style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '9px',
                    color: '#6ED47A',
                    letterSpacing: '2px',
                    marginBottom: '32px',
                  }}>
                    LA DIRECTION VOUS RÉPONDRA APRÈS LA PAUSE CAFÉ.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '3px',
                      color: '#fff',
                      background: '#2A6040',
                      border: '1px solid #7AEC7A',
                      padding: '12px 32px',
                      cursor: 'pointer',
                      boxShadow: '0 0 14px rgba(122,236,122,.18)',
                    }}
                  >
                    NOUVEAU MESSAGE
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{
                    fontFamily: "'Lilita One', cursive",
                    fontSize: '20px',
                    color: '#7AEC7A',
                    letterSpacing: '3px',
                    marginBottom: '28px',
                    textShadow: '0 0 12px rgba(122,236,122,.25)',
                  }}>
                    ENVOYER UN MESSAGE
                  </h2>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {[
                      { id: 'nom', label: 'NOM / PSEUDO', type: 'text', placeholder: 'Votre pseudo...' },
                      { id: 'email', label: 'EMAIL', type: 'email', placeholder: 'votre@email.com' },
                      { id: 'objet', label: 'OBJET', type: 'text', placeholder: 'Sujet du message...' },
                    ].map(field => (
                      <div key={field.id}>
                        <label style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: '7px',
                          color: '#3A8040',
                          letterSpacing: '3px',
                          display: 'block',
                          marginBottom: '6px',
                        }}>
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required
                          placeholder={field.placeholder}
                          style={{
                            width: '100%',
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: '11px',
                            color: '#C5EAC5',
                            background: '#131E08',
                            border: '1px solid #2A6040',
                            padding: '10px 14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                          onFocus={e => {
                            e.target.style.borderColor = '#7AEC7A';
                            e.target.style.boxShadow = '0 0 8px rgba(122,236,122,.2)';
                          }}
                          onBlur={e => {
                            e.target.style.borderColor = '#2A6040';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '7px',
                        color: '#3A8040',
                        letterSpacing: '3px',
                        display: 'block',
                        marginBottom: '6px',
                      }}>
                        MESSAGE
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Votre message..."
                        style={{
                          width: '100%',
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: '11px',
                          color: '#C5EAC5',
                          background: '#131E08',
                          border: '1px solid #2A6040',
                          padding: '10px 14px',
                          outline: 'none',
                          resize: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = '#7AEC7A';
                          e.target.style.boxShadow = '0 0 8px rgba(122,236,122,.2)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#2A6040';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '4px',
                        color: '#fff',
                        background: '#2A6040',
                        border: '1px solid #7AEC7A',
                        padding: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 0 18px rgba(122,236,122,.18)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#3A8040';
                        e.currentTarget.style.boxShadow = '0 0 28px rgba(122,236,122,.35)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#2A6040';
                        e.currentTarget.style.boxShadow = '0 0 18px rgba(122,236,122,.18)';
                      }}
                    >
                      ENVOYER →
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
