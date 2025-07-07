import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Location de Vacances Premium',
  description: 'Découvrez nos propriétés exceptionnelles pour des vacances inoubliables. Locations de luxe avec services personnalisés.',
  keywords: 'location vacances, villa luxe, appartement, maison vacances, séjour premium',
  authors: [{ name: 'La Villa Roya' }],
  creator: 'La Villa Roya',
  publisher: 'La Villa Roya',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://La-villa-roya.fr',
    siteName: 'Location de Vacances Premium',
    title: 'Location de Vacances Premium',
    description: 'Découvrez nos propriétés exceptionnelles pour des vacances inoubliables. Locations de luxe avec services personnalisés.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Location de Vacances Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Location de Vacances Premium',
    description: 'Découvrez nos propriétés exceptionnelles pour des vacances inoubliables. Locations de luxe avec services personnalisés.',
    images: ['/images/og-default.jpg'],
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