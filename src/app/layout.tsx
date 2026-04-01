import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GUIBOUR SYSTEM — guibour.fr',
  description: 'GUIBOUR SYSTEM — Le jeu bureaucratique le plus absurde du web. Survivez aux dossiers volants dans un open space Excel.',
  metadataBase: new URL('https://guibour.fr'),
  openGraph: {
    title: 'GUIBOUR SYSTEM — guibour.fr',
    description: 'Survivez aux dossiers volants dans un open space Excel.',
    url: 'https://guibour.fr',
    siteName: 'guibour.fr',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GUIBOUR SYSTEM — guibour.fr',
    description: 'Survivez aux dossiers volants dans un open space Excel.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Preconnect pour Google Fonts — réduit la latence initiale */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Uniquement les 3 familles réellement utilisées (suppression Share Tech Mono / Bangers / Space Grotesk) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Luckiest+Guy&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
