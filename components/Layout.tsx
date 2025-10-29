'use client';

import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  Mail, 
  Instagram,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export default function Layout({
  children,
  title = "Location de Vacances Premium",
  description = "Découvrez nos propriétés exceptionnelles pour des vacances inoubliables. Locations de luxe avec services personnalisés.",
  keywords = "location vacances, villa luxe, appartement, maison vacances, séjour premium",
  ogImage = "/images/og-default.jpg",
  canonical
}: LayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fullTitle = title === "Location de Vacances Premium" ? title : `${title} | Location de Vacances Premium`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = canonical || currentUrl;

  // Navigation items
  const navItems: NavItem[] = [
    { href: '#hero', label: 'Accueil', icon: <Home className="h-4 w-4" /> },
    { href: '#villa', label: 'À propos', icon: <MapPin className="h-4 w-4" /> },
    { href: '#decouverte', label: 'Galerie', icon: <MapPin className="h-4 w-4" /> },
    { href: '#reservation', label: 'Réserver', icon: <Calendar className="h-4 w-4" /> }
  ];

  // Smooth scroll to section
  const scrollToSection = (href: string) => {
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Hauteur de la navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    console.log("ça boucle 40")
    setMobileMenuOpen(false);
  }, [router]);

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="title" content={fullTitle} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Location de Vacances Premium" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="French" />
        <meta name="revisit-after" content="7 days" />

        {/* Canonical URL */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Location de Vacances Premium" />
        <meta property="og:locale" content="fr_FR" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={fullTitle} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Location de Vacances Premium",
              "description": description,
              "url": currentUrl,
              "logo": `${currentUrl}/logo.png`,
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+33-1-23-45-67-89",
                "contactType": "customer service",
                "availableLanguage": ["French", "English"]
              },
              "sameAs": [
                "https://instagram.com/locationvacances"
              ]
            })
          }}
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header 
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200"
          role="banner"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1"
                aria-label="Retour à l'accueil"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    La Villa Roya
                  </h1>
                  <p className="text-xs text-muted-foreground">Vos vacances de rêves</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Navigation principale">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                    aria-label={item.label}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Mobile Menu */}
              <div className="flex items-center gap-4">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden p-2"
                      aria-label="Ouvrir le menu de navigation"
                      aria-expanded={mobileMenuOpen}
                      aria-controls="mobile-menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80" id="mobile-menu">
                    <div className="flex flex-col h-full">
                      {/* Mobile Menu Header */}
                      <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                            <Home className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-foreground">La Villa Roya</h2>
                            <p className="text-xs text-muted-foreground">Menu</p>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <Button variant="ghost" size="sm" className="p-2" aria-label="Fermer le menu">
                            <X className="h-4 w-4" />
                          </Button>
                        </SheetClose>
                      </div>

                      {/* Mobile Navigation */}
                      <nav className="flex-1 py-6" role="navigation" aria-label="Navigation mobile">
                        <ul className="space-y-2">
                          {navItems.map((item) => (
                            <li key={item.href}>
                              <button
                                onClick={() => scrollToSection(item.href)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              >
                                {item.icon}
                                {item.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-20" role="main">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-50 border-t border-gray-200" role="contentinfo">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">La Villa Roya</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Un lieu privé et élégant pour des séjours d’exception.
                  Savourez luxe, confort et tranquillité dans un environnement privilégié.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Navigation</h4>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                    <a 
                      href="https://wa.me/33123456789" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors focus:outline-none focus:underline"
                      aria-label="Contacter via WhatsApp"
                    >
                      +33 6 83 86 30 64
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a 
                      href="mailto:agduval77@gmail.com" 
                      className="hover:text-foreground transition-colors focus:outline-none focus:underline"
                      aria-label="Envoyer un email à agduval77@gmail.com"
                    >
                      agduval77@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()}. Tous droits réservés.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <Link 
                    href="/privacy" 
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                  >
                    Confidentialité
                  </Link>
                  <Link 
                    href="/terms" 
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                  >
                    Conditions
                  </Link>
                  <Link 
                    href="/cookies" 
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                  >
                    Cookies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}