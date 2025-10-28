import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Villa Ben & Bella - Location de luxe en Tunisie',
  description: 'Découvrez notre villa de prestige avec piscine privée, terrasses panoramiques et vue sur les montagnes. Location haut de gamme pour vos vacances en Tunisie.',
  keywords: ['villa luxe tunisie', 'location vacances tunisie', 'piscine privée', 'villa avec vue', 'location haut de gamme', 'saint-florent', 'villa moderne', 'vacances luxe'],
  authors: [{ name: 'Villa Ben & Bella' }],
  creator: 'Villa Ben & Bella',
  publisher: 'Villa Ben & Bella',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://benb-74435.web.app',
    siteName: 'Villa Ben & Bella',
    title: 'Villa Ben & Bella - Location de luxe en Tunisie',
    description: 'Villa de prestige avec piscine privée, 5 chambres, terrasses panoramiques. Location haut de gamme pour des vacances inoubliables en Tunisie.',
    images: [
      {
        url: 'https://benb-74435.web.app/assets/images/CoverHero.avif',
        width: 1200,
        height: 630,
        alt: 'Villa Ben & Bella - Vue panoramique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Villa Ben & Bella - Location de luxe',
    description: 'Villa de prestige avec piscine privée en Tunisie. 5 chambres, vue panoramique, équipements haut de gamme.',
    images: ['https://benb-74435.web.app/assets/images/CoverHero.avif'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}