'use client';

import { useState, useRef } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';

export default function ContactPage() {
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const formRef               = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value,
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
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
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi. Reessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CONTACT("GUIBOUR") // W.O.W' breadcrumb="ETAGE 4 > CONTACT">
        <div style={{
          minHeight: 'calc(100vh - 52px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px',
        }}>

          {sent ? (
            /* -- Confirmation -- */
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                border: '2px solid #1A1A1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', color: '#1A1A1A',
              }}>✓</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '32px', color: '#1A1A1A', letterSpacing: '4px' }}>
                MESSAGE ENVOYE
              </div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '3px' }}>
                LA DIRECTION VOUS REPONDRA APRES LA PAUSE CAFE.
              </div>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: '8px',
                  fontFamily: "'Courier New', monospace", fontSize: '14px', letterSpacing: '3px',
                  color: '#1A1A1A', background: 'transparent',
                  border: '2px solid #D4CFC4', padding: '12px 32px',
                  cursor: 'pointer', transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4CFC4'; }}
              >NOUVEAU MESSAGE</button>
            </div>

          ) : (
            /* -- Form -- */
            <div style={{ width: '100%', maxWidth: '560px' }}>

              {/* Title */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '5px', marginBottom: '8px' }}>
                  04 / CONTACT
                </div>
                <div style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(28px,5vw,42px)', color: '#1A1A1A',
                  letterSpacing: '4px', lineHeight: 1,
                }}>
                  NOUS CONTACTER
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelCss}>NOM / PSEUDO</label>
                    <input name="name" type="text" required placeholder="Votre nom..." style={inputCss} />
                  </div>
                  <div>
                    <label style={labelCss}>EMAIL</label>
                    <input name="email" type="email" required placeholder="votre@email.com" style={inputCss} />
                  </div>
                </div>

                <div>
                  <label style={labelCss}>OBJET</label>
                  <input name="subject" type="text" required placeholder="Sujet du message..." style={inputCss} />
                </div>

                <div>
                  <label style={labelCss}>MESSAGE</label>
                  <textarea
                    name="message" required rows={6} placeholder="Votre message..."
                    style={{ ...inputCss, resize: 'none', lineHeight: 1.7 }}
                  />
                </div>

                {error && (
                  <div style={{
                    fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#CC0000',
                    letterSpacing: '1px', padding: '12px 16px',
                    background: 'rgba(200,0,0,.05)', border: '1px solid rgba(200,0,0,.3)',
                  }}>! {error}</div>
                )}

                <button
                  type="submit" disabled={sending}
                  style={{
                    marginTop: '8px',
                    fontFamily: "'Anton', sans-serif", fontSize: '17px', letterSpacing: '4px',
                    color: '#fff',
                    background: sending ? '#666' : '#1A1A1A',
                    border: '2px solid #1A1A1A',
                    padding: '15px 0',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    transition: 'all .25s ease',
                    opacity: sending ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = '#333'; } }}
                  onMouseLeave={e => { if (!sending) { e.currentTarget.style.background = '#1A1A1A'; } }}
                >
                  {sending ? 'ENVOI...' : 'ENVOYER'}
                </button>

              </form>
            </div>
          )}

        </div>
      </ExcelChrome>
      <style>{`
        ::placeholder { color: rgba(0,0,0,.35) !important; }
      `}</style>
    </div>
  );
}

const labelCss: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Courier New', monospace",
  fontSize: '11px',
  color: '#1A1A1A',
  letterSpacing: '3px',
  marginBottom: '8px',
};

const inputCss: React.CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #D4CFC4',
  padding: '12px 16px',
  fontFamily: "'Courier New', monospace",
  fontSize: '12px',
  color: '#1A1A1A',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .2s',
};
