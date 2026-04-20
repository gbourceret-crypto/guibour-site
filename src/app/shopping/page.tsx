'use client';

import { useState, useCallback } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';
import ScrollReveal from '@/components/ui/ScrollReveal';

// --- Catalogue ---
const PRODUCTS = [
  { name: 'T-SHIRT GS',    ref: 'GS-TS-001', desc: 'UNISEX / COTON BIO', price: 29, cell: 'B4', svgType: 'tshirt', tag: 'BEST SELLER' },
  { name: 'MUG CORPORATE', ref: 'GS-MG-001', desc: '30CL / CERAMIQUE',   price: 18, cell: 'C4', svgType: 'mug',    tag: null          },
  { name: 'CRAVATE GS',    ref: 'GS-CV-001', desc: 'BLEU MARINE / SOIE', price: 24, cell: 'D4', svgType: 'tie',    tag: 'NOUVEAU'     },
  { name: 'CLE USB EP',    ref: 'GS-USB-001', desc: '8GB / USB-A',       price: 22, cell: 'E4', svgType: 'usb',    tag: null          },
  { name: 'BILLET CONCERT', ref: 'GS-BN-001', desc: 'LA BOULE NOIRE / 24 JUIN', price: 0, cell: 'F4', svgType: 'ticket', tag: 'CONCERT' },
] as const;

type Product = typeof PRODUCTS[number];
interface CartLine { product: Product; qty: number }
type Screen = 'shop' | 'cart' | 'checkout' | 'confirmation';

// --- SVG produits (noir) ---
function ProductSVG({ type, glow }: { type: string; glow?: boolean }) {
  const c = '#1A1A1A';
  const wrap: React.CSSProperties = {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'filter .3s',
  };

  if (type === 'tshirt') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <path d="M20 15 L10 25 L18 30 L18 65 L62 65 L62 30 L70 25 L60 15 L50 22 C47 25 33 25 30 22 Z"
          fill="none" stroke={c} strokeWidth="2"/>
        <path d="M50 22 C47 25 33 25 30 22" fill="none" stroke={c} strokeWidth="1.5"/>
        <text x="40" y="48" textAnchor="middle" fontFamily="Courier New" fontSize="8" fontWeight="800"
          fill={c} letterSpacing="1" opacity=".85">GS</text>
      </svg>
    </div>
  );
  if (type === 'mug') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <rect x="18" y="25" width="34" height="38" rx="2" fill="none" stroke={c} strokeWidth="2"/>
        <path d="M52 32 C60 32 62 38 62 42 C62 46 60 52 52 52" fill="none" stroke={c} strokeWidth="2"/>
        <path d="M28 22 C28 18 32 16 35 19" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5"/>
        <path d="M35 20 C35 16 39 14 42 17" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5"/>
        <text x="35" y="48" textAnchor="middle" fontFamily="Courier New" fontSize="6" fontWeight="700"
          fill={c} opacity=".8">CORP.</text>
      </svg>
    </div>
  );
  if (type === 'tie') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <path d="M35 10 L45 10 L43 20 L48 22 L40 70 L32 22 L37 20 Z"
          fill="none" stroke={c} strokeWidth="2"/>
        <line x1="37" y1="30" x2="43" y2="30" stroke={c} strokeWidth="1" opacity=".6"/>
        <line x1="37.5" y1="38" x2="42.5" y2="38" stroke={c} strokeWidth="1" opacity=".6"/>
        <line x1="38" y1="46" x2="42" y2="46" stroke={c} strokeWidth="1" opacity=".6"/>
      </svg>
    </div>
  );
  if (type === 'ticket') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <path d="M12 25 L12 35 C16 35 16 45 12 45 L12 55 L68 55 L68 45 C64 45 64 35 68 35 L68 25 Z"
          fill="none" stroke={c} strokeWidth="2"/>
        <line x1="45" y1="25" x2="45" y2="55" stroke={c} strokeWidth="1" strokeDasharray="3 3" opacity=".6"/>
        <text x="28" y="38" textAnchor="middle" fontFamily="Courier New" fontSize="5" fontWeight="700"
          fill={c} opacity=".9">BOULE</text>
        <text x="28" y="47" textAnchor="middle" fontFamily="Courier New" fontSize="5" fontWeight="700"
          fill={c} opacity=".9">NOIRE</text>
        <text x="56" y="42" textAnchor="middle" fontFamily="Courier New" fontSize="6" fontWeight="800"
          fill={c}>24/06</text>
      </svg>
    </div>
  );
  return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <rect x="25" y="20" width="30" height="44" rx="3" fill="none" stroke={c} strokeWidth="2"/>
        <rect x="30" y="12" width="20" height="10" rx="1" fill="none" stroke={c} strokeWidth="1.5"/>
        <rect x="34" y="14" width="4" height="6" fill={c} opacity=".8"/>
        <rect x="42" y="14" width="4" height="6" fill={c} opacity=".8"/>
        <text x="40" y="42" textAnchor="middle" fontFamily="Courier New" fontSize="5" fontWeight="700"
          fill={c} opacity=".9">GUIBOUR</text>
        <text x="40" y="50" textAnchor="middle" fontFamily="Courier New" fontSize="5"
          fill={c} opacity=".6">8GB</text>
      </svg>
    </div>
  );
}

// --- Carte produit ---
function ProductCard({ p, onAdd }: { p: Product; onAdd: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${hovered ? '#1A1A1A' : '#D4CFC4'}`,
        display: 'flex', flexDirection: 'column', position: 'relative',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Reference bar */}
      <div style={{
        background: '#F5F0E8',
        padding: '8px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #D4CFC4',
      }}>
        <span style={{
          fontFamily: "'Courier New', monospace", fontSize: '11px',
          color: '#666', letterSpacing: '2px',
        }}>{p.cell}</span>
        <span style={{
          fontFamily: "'Courier New', monospace", fontSize: '11px',
          color: '#999', letterSpacing: '1px',
        }}>REF: {p.ref}</span>
      </div>

      {/* Tag badge */}
      {p.tag && (
        <div style={{
          position: 'absolute', top: '42px', left: '10px', zIndex: 2,
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #1A1A1A',
          fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '2px', padding: '3px 8px',
        }}>{p.tag}</div>
      )}

      {/* Product illustration */}
      <div style={{
        height: '140px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ProductSVG type={p.svgType} glow={hovered} />
      </div>

      {/* Info */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: "'Anton', sans-serif", fontSize: '16px',
          color: '#1A1A1A',
          letterSpacing: '2px', marginBottom: '3px',
        }}>{p.name}</h3>
        <span style={{
          fontFamily: "'Courier New', monospace", fontSize: '11px',
          color: '#999', letterSpacing: '2px', display: 'block', marginBottom: '12px',
        }}>{p.desc}</span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto', marginBottom: '16px' }}>
          <span style={{
            fontFamily: "'Anton', sans-serif", fontSize: '26px',
            color: '#1A1A1A',
          }}>{p.price === 0 ? 'LIVE' : `${p.price}E`}</span>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '1px' }}>{p.price === 0 ? '24 JUIN 2026' : 'TVA INCL.'}</span>
        </div>

        {p.svgType === 'ticket' ? (
          <a
            href="https://shotgun.live/fr/events/guibour-la-boule-noire"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '2px',
              color: '#fff',
              background: '#1A1A1A',
              border: '1px solid #1A1A1A',
              padding: '11px 0', cursor: 'pointer',
              transition: 'all .2s ease', textDecoration: 'none',
            }}
          >RESERVER SUR SHOTGUN</a>
        ) : (
          <button
            onClick={handleAdd}
            style={{
              width: '100%',
              fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '2px',
              color: added ? '#fff' : '#1A1A1A',
              background: added ? '#1A1A1A' : 'transparent',
              border: '1px solid #1A1A1A',
              padding: '11px 0', cursor: 'pointer',
              transition: 'all .2s ease',
            }}
          >{added ? '+ AJOUTE' : '+ AJOUTER AU PANIER'}</button>
        )}
      </div>
    </div>
  );
}

// --- Panier lateral ---
function CartPanel({
  cart, total, onQty, onCheckout, onClose,
}: {
  cart: CartLine[]; total: number;
  onQty: (ref: string, delta: number) => void;
  onCheckout: () => void; onClose: () => void;
}) {
  return (
    <div style={{
      width: '320px', flexShrink: 0,
      background: '#FFFFFF',
      border: '1px solid #D4CFC4',
      borderRadius: '2px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        background: '#F5F0E8', padding: '12px 16px',
        borderBottom: '1px solid #D4CFC4',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#1A1A1A', letterSpacing: '3px' }}>
          PANIER // {cart.reduce((s, l) => s + l.qty, 0)} ARTICLE(S)
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#999', cursor: 'pointer',
          fontSize: '16px', padding: '0 4px',
        }}>x</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {cart.length === 0 ? (
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999',
            letterSpacing: '2px', padding: '24px', textAlign: 'center',
          }}>PANIER VIDE</div>
        ) : cart.map(line => (
          <div key={line.product.ref} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 8px',
            borderBottom: '1px solid #EDE8DF',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '13px', color: '#1A1A1A', letterSpacing: '1px' }}>
                {line.product.name}
              </div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', marginTop: '2px' }}>
                {line.product.price}E x {line.qty} = {line.product.price * line.qty}E
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[-1, +1].map(d => (
                <button key={d} onClick={() => onQty(line.product.ref, d)} style={{
                  width: '22px', height: '22px', background: 'transparent',
                  border: '1px solid #D4CFC4', color: '#1A1A1A',
                  cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4CFC4'; }}
                >{d > 0 ? '+' : '-'}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ padding: '16px 16px', borderTop: '1px solid #D4CFC4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '3px' }}>TOTAL</span>
            <span style={{
              fontFamily: "'Anton', sans-serif", fontSize: '24px', color: '#1A1A1A',
            }}>{total}E</span>
          </div>
          <button onClick={onCheckout} style={{
            width: '100%', fontFamily: "'Anton', sans-serif", fontSize: '15px',
            letterSpacing: '3px', color: '#fff',
            background: '#1A1A1A',
            border: 'none', padding: '13px', cursor: 'pointer',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#333'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A'; }}
          >VALIDER LA COMMANDE</button>
        </div>
      )}
    </div>
  );
}

export default function ShoppingPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [screen, setScreen] = useState<Screen>('shop');
  const [showCart, setShowCart] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', address: '' });
  const [orderRef] = useState(() => 'GS-' + Math.floor(Math.random() * 90000 + 10000));

  const total = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  const handleAdd = useCallback((p: Product) => {
    setCart(prev => {
      const existing = prev.find(l => l.product.ref === p.ref);
      return existing
        ? prev.map(l => l.product.ref === p.ref ? { ...l, qty: l.qty + 1 } : l)
        : [...prev, { product: p, qty: 1 }];
    });
    setShowCart(true);
  }, []);

  const handleQty = useCallback((ref: string, delta: number) => {
    setCart(prev =>
      prev
        .map(l => l.product.ref === ref ? { ...l, qty: l.qty + delta } : l)
        .filter(l => l.qty > 0)
    );
  }, []);

  if (screen === 'confirmation') {
    return (
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <ExcelNav />
        <ExcelChrome formulaText='=ORDER_CONFIRMED() // MERCI // W.O.W' breadcrumb="ETAGE 3 > BOUTIQUE">
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: 'calc(100vh - 52px)', gap: '20px', padding: '40px',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: '2px solid #1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', color: '#1A1A1A',
            }}>OK</div>
            <div style={{
              fontFamily: "'Anton', sans-serif", fontSize: '36px', color: '#1A1A1A',
              letterSpacing: '4px', textAlign: 'center',
            }}>COMMANDE RECUE</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '3px' }}>
              ON VOUS ENVOIE CA... APRES LA PAUSE CAFE.
            </div>
            <div style={{
              fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999',
              padding: '8px 18px', border: '1px solid #D4CFC4',
              letterSpacing: '2px',
            }}>
              {`=ORDER_REF("${orderRef}") // STATUS: PROCESSING`}
            </div>
            <button
              onClick={() => { setScreen('shop'); setCart([]); setShowCart(false); }}
              style={{
                marginTop: '16px', fontFamily: "'Courier New', monospace", fontSize: '14px',
                letterSpacing: '3px', color: '#1A1A1A', background: 'transparent',
                border: '2px solid #D4CFC4', padding: '13px 34px', cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4CFC4'; }}
            >CONTINUER LES ACHATS</button>
          </div>
        </ExcelChrome>
      </div>
    );
  }

  if (screen === 'checkout') {
    return (
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <ExcelNav />
        <ExcelChrome formulaText='=CHECKOUT() // LIVRAISON_INFO // W.O.W' breadcrumb="ETAGE 3 > BOUTIQUE">
          <div style={{
            minHeight: 'calc(100vh - 52px)',
          }}>
            {/* Header */}
            <div style={{
              background: '#FFFFFF',
              padding: '28px 48px 24px', borderBottom: '1px solid #D4CFC4',
              display: 'flex', alignItems: 'center', gap: '20px',
            }}>
              <GlobeIcon size={44} color="#1A1A1A" />
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '5px' }}>BOUTIQUE</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '28px', color: '#1A1A1A', letterSpacing: '3px' }}>
                  FINALISER LA COMMANDE
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '0', minHeight: 'calc(100vh - 195px)' }}>

              {/* Form */}
              <div style={{ padding: '40px 48px' }}>
                <form onSubmit={e => { e.preventDefault(); setScreen('confirmation'); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '500px' }}>
                  {[
                    { key: 'name',    label: 'NOM COMPLET',     type: 'text',  placeholder: 'Votre nom...' },
                    { key: 'email',   label: 'EMAIL',            type: 'email', placeholder: 'votre@email.com' },
                    { key: 'address', label: 'ADRESSE LIVRAISON',type: 'text',  placeholder: '123 rue du Bureau...' },
                  ].map(f => (
                    <div key={f.key} style={{
                      background: '#FFFFFF',
                      border: '1px solid #D4CFC4',
                      padding: '12px 16px 10px', marginBottom: '2px',
                    }}>
                      <label style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#1A1A1A', letterSpacing: '3px', marginBottom: '8px' }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type} required placeholder={f.placeholder}
                        value={checkoutForm[f.key as keyof typeof checkoutForm]}
                        onChange={ev => setCheckoutForm(prev => ({ ...prev, [f.key]: ev.target.value }))}
                        style={{
                          width: '100%', border: 'none', background: 'transparent',
                          fontFamily: "'Courier New', monospace", fontSize: '12px',
                          color: '#1A1A1A', outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => { e.currentTarget.closest('div')!.style.borderColor = '#1A1A1A'; }}
                        onBlur={e => { e.currentTarget.closest('div')!.style.borderColor = '#D4CFC4'; }}
                      />
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setScreen('shop')} style={{
                      fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '2px',
                      color: '#666', background: 'transparent',
                      border: '1px solid #D4CFC4', padding: '13px 24px', cursor: 'pointer',
                    }}>&lt;- RETOUR</button>
                    <button type="submit" style={{
                      flex: 1, fontFamily: "'Anton', sans-serif", fontSize: '16px', letterSpacing: '3px',
                      color: '#fff', background: '#1A1A1A',
                      border: 'none', padding: '13px', cursor: 'pointer',
                    }}>CONFIRMER LA COMMANDE</button>
                  </div>
                </form>
              </div>

              {/* Order recap */}
              <div style={{
                background: '#FFFFFF', borderLeft: '1px solid #D4CFC4',
                padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '0',
              }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#1A1A1A', letterSpacing: '3px', marginBottom: '16px', fontWeight: 700 }}>
                  RECAPITULATIF
                </div>
                {cart.map(line => (
                  <div key={line.product.ref} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: '1px solid #EDE8DF',
                  }}>
                    <div>
                      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '13px', color: '#1A1A1A' }}>{line.product.name}</div>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999' }}>QTE: {line.qty}</div>
                    </div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '15px', color: '#1A1A1A', alignSelf: 'center' }}>
                      {line.product.price * line.qty}E
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #D4CFC4', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#666', letterSpacing: '3px' }}>TOTAL</span>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '28px', color: '#1A1A1A' }}>{total}E</span>
                </div>
              </div>
            </div>
          </div>
        </ExcelChrome>
      </div>
    );
  }

  // -- SHOP VIEW --
  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=BOUTIQUE("W.O.W") // CATALOGUE_MERCH // SAISON_01' breadcrumb="ETAGE 3 > BOUTIQUE">

        <div style={{
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* Header */}
          <ScrollReveal><div style={{
            background: '#FFFFFF',
            padding: '28px 48px 24px',
            borderBottom: '1px solid #D4CFC4',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <GlobeIcon size={52} color="#1A1A1A" />
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#999', letterSpacing: '5px', marginBottom: '4px' }}>
                  03 / BOUTIQUE
                </div>
                <div style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(22px,4vw,36px)', color: '#1A1A1A',
                  letterSpacing: '4px', lineHeight: 1,
                }}>BOUTIQUE W.O.W</div>
                <div style={{
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  color: '#666', letterSpacing: '4px', marginTop: '4px',
                }}>MERCH OFFICIEL — SAISON 01</div>
              </div>
            </div>

            {/* Cart button */}
            <button
              onClick={() => setShowCart(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '2px',
                color: '#1A1A1A',
                background: 'transparent',
                border: `1px solid ${itemCount > 0 ? '#1A1A1A' : '#D4CFC4'}`,
                padding: '12px 20px', cursor: 'pointer',
                transition: 'all .25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = itemCount > 0 ? '#1A1A1A' : '#D4CFC4'; }}
            >
              PANIER
              {itemCount > 0 && (
                <span style={{
                  background: '#1A1A1A', color: '#fff',
                  fontFamily: "'Courier New', monospace", fontSize: '11px', fontWeight: 700,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{itemCount}</span>
              )}
            </button>
          </div></ScrollReveal>

          {/* Main content */}
          <div style={{
            display: 'flex', gap: '0', alignItems: 'flex-start',
            padding: '32px 32px 48px',
          }}>

            {/* Products grid */}
            <ScrollReveal style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '2px',
              marginRight: showCart ? '24px' : '0',
              transition: 'margin .3s',
            }}>
              {PRODUCTS.map(p => (
                <ProductCard key={p.ref} p={p} onAdd={handleAdd} />
              ))}

              {/* Note */}
              <div style={{
                gridColumn: '1 / -1', marginTop: '16px',
                fontFamily: "'Courier New', monospace", fontSize: '11px',
                color: '#999', letterSpacing: '2px', lineHeight: 1.8,
                padding: '12px', border: '1px solid #D4CFC4',
              }}>
                =NOTE("LIVRAISON SOUS 5 JOURS OUVRES / SERVICE EXPEDITION / RDC GAUCHE / EXT.342")
                <br />
                =DISCLAIMER("CES ARTICLES SONT REELS ET FICTIFS A LA FOIS. VOUS LES RECEVREZ PEUT-ETRE. OU PAS.")
              </div>
            </ScrollReveal>

            {/* Cart panel */}
            {showCart && (
              <CartPanel
                cart={cart} total={total}
                onQty={handleQty}
                onCheckout={() => setScreen('checkout')}
                onClose={() => setShowCart(false)}
              />
            )}
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
