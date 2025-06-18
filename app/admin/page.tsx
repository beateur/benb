'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Home, 
  Calendar, 
  Settings, 
  BarChart3, 
  LogOut,
  Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("ça boucle 11")
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

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

  const adminModules = [
    {
      icon: <Home className="h-6 w-6" />,
      title: "Propriétés",
      description: "Gérer les propriétés et leurs détails",
      badge: "CRUD",
      href: "/admin/properties"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Réservations",
      description: "Suivre et gérer les réservations",
      badge: "Gestion",
      href: "/admin/reservations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Utilisateurs",
      description: "Administration des comptes utilisateurs",
      badge: "Admin",
      href: "/admin/users"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Statistiques",
      description: "Tableaux de bord et analytics",
      badge: "Analytics",
      href: "/admin/analytics"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Disponibilités",
      description: "Gérer les calendriers de disponibilité",
      badge: "Planning",
      href: "/admin/availability"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Paramètres",
      description: "Configuration générale du système",
      badge: "Config",
      href: "/admin/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Panneau d'administration</h1>
              <p className="text-muted-foreground">
                Bienvenue, {user.email}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        {/* Admin Status */}
        <Card className="mb-8 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Statut administrateur actif
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Admin
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
              onClick={() => router.push(module.href)}
            >
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 group-hover:bg-primary/20 transition-colors mx-auto">
                  {module.icon}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {module.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {module.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Propriétés actives</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-800 dark:text-green-200">Réservations ce mois</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-purple-800 dark:text-purple-200">Utilisateurs inscrits</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">0€</div>
                <div className="text-sm text-orange-800 dark:text-orange-200">Revenus ce mois</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}