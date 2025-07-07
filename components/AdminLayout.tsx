'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Shield, 
  Home, 
  Camera, 
  FileText, 
  Euro, 
  Calendar, 
  Star, 
  Download, 
  LogOut,
  Menu,
  X,
  Settings,
  Users,
  BarChart3,
  Bell,
  Search,
  Loader2
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  description?: string;
}

export default function AdminLayout({ children, title = "Administration" }: AdminLayoutProps) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("ça boucle 33")
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("ça boucle 34")
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const sidebarItems: SidebarItem[] = [
    {
      href: '/admin',
      label: 'Tableau de bord',
      icon: <Home className="h-5 w-5" />,
      description: 'Vue d\'ensemble'
    },
    {
      href: '/admin/properties',
      label: 'Propriétés',
      icon: <Home className="h-5 w-5" />,
      description: 'Gestion des biens'
    },
    {
      href: '/admin/photos',
      label: 'Photos',
      icon: <Camera className="h-5 w-5" />,
      description: 'Galeries et médias'
    },
    {
      href: '/admin/content',
      label: 'Textes',
      icon: <FileText className="h-5 w-5" />,
      description: 'Contenu éditorial'
    },
    {
      href: '/admin/pricing',
      label: 'Tarifs',
      icon: <Euro className="h-5 w-5" />,
      description: 'Gestion des prix'
    },
    {
      href: '/admin/availability',
      label: 'Disponibilités',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Calendrier de réservation'
    },
    {
      href: '/admin/events',
      label: 'Événements',
      icon: <Star className="h-5 w-5" />,
      description: 'Événements locaux'
    },
    {
      href: '/admin/reservations',
      label: 'Réservations',
      icon: <Calendar className="h-5 w-5" />,
      badge: '3',
      description: 'Gestion des réservations'
    },
    {
      href: '/admin/users',
      label: 'Utilisateurs',
      icon: <Users className="h-5 w-5" />,
      description: 'Gestion des comptes'
    },
    {
      href: '/admin/analytics',
      label: 'Statistiques',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Analyses et rapports'
    },
    {
      href: '/admin/export',
      label: 'Export CSV',
      icon: <Download className="h-5 w-5" />,
      description: 'Exportation de données'
    },
    {
      href: '/admin/settings',
      label: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configuration système'
    }
  ];

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">La Villa Roya</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground/70 truncate">
                  {item.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">Administrateur</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-white lg:dark:bg-slate-900 lg:border-r lg:border-border">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>

          {/* Breadcrumb */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* Quick Actions */}
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Voir le site
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}