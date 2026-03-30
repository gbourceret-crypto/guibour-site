'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sphere from './Sphere';

const tabs = [
  { href: '/', label: 'JOUER' },
  { href: '/resultats', label: 'CLASSEMENT' },
  { href: '/shopping', label: 'MERCH' },
  { href: '/contact', label: 'CONTACT' },
];

export default function ExcelNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        width: '48px',
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        background: '#0D2B5E',
        borderRight: '2px solid #1B3A6B',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 16px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => { e.currentTarget.style.width = '200px'; }}
      onMouseLeave={e => { e.currentTarget.style.width = '48px'; }}
    >
      {/* Logo area */}
      <div style={{
        padding: '12px 0',
        borderBottom: '1px solid #1B3A6B',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingLeft: '10px',
        flexShrink: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <Sphere size={28} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '13px',
            color: '#A8D8FF',
            letterSpacing: '2px',
            lineHeight: 1.1,
          }}>GUIBOUR</div>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '9px',
            color: '#00D4CC',
            letterSpacing: '3px',
          }}>SYSTEM</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
        {tabs.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                fontFamily: "'Lilita One', cursive",
                fontSize: '13px',
                letterSpacing: '2px',
                color: active ? '#A8D8FF' : '#3C5A7A',
                textDecoration: 'none',
                borderLeft: active ? '3px solid #0047AB' : '3px solid transparent',
                background: active ? 'rgba(0,71,171,0.22)' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textShadow: active ? '0 0 10px rgba(168,216,255,.45)' : 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = '#A8D8FF';
                  e.currentTarget.style.background = 'rgba(0,71,171,0.12)';
                  e.currentTarget.style.textShadow = '0 0 8px rgba(168,216,255,.3)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = '#3C5A7A';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.textShadow = 'none';
                }
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom JOUER button */}
      <div style={{
        borderTop: '1px solid #1B3A6B',
        padding: '12px 10px',
        flexShrink: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Lilita One', cursive",
            fontSize: '15px',
            letterSpacing: '4px',
            color: '#fff',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #0047AB, #007B8A)',
            border: '1px solid #5B9BD5',
            padding: '10px 12px',
            boxShadow: '0 0 14px rgba(0,71,171,.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)';
            e.currentTarget.style.boxShadow = '0 0 22px rgba(0,71,171,.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)';
            e.currentTarget.style.boxShadow = '0 0 14px rgba(0,71,171,.25)';
          }}
        >
          JOUER
        </Link>
      </div>
    </nav>
  );
}
