import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VillaRoya - Location de luxe en Corse',
  description: 'Découvrez notre villa de prestige avec piscine privée, terrasses panoramiques et vue sur les montagnes. Location haut de gamme pour vos vacances en Corse.',
  keywords: ['villa luxe corse', 'location vacances corse', 'piscine privée', 'villa avec vue', 'location haut de gamme', 'saint-florent', 'villa moderne', 'vacances luxe'],
  authors: [{ name: 'VillaRoya' }],
  creator: 'VillaRoya',
  publisher: 'VillaRoya',
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
    siteName: 'VillaRoya',
    title: 'VillaRoya - Location de luxe en Corse',
    description: 'Villa de prestige avec piscine privée, 5 chambres, terrasses panoramiques. Location haut de gamme pour des vacances inoubliables en Corse.',
    images: [
      {
        url: 'https://benb-74435.web.app/assets/images/CoverHero.avif',
        width: 1200,
        height: 630,
        alt: 'VillaRoya - Vue panoramique en Corse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VillaRoya - Location de luxe en Corse',
    description: 'Villa de prestige avec piscine privée en Corse. 5 chambres, vue panoramique, équipements haut de gamme.',
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
    <html lang="fr" className="light">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
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