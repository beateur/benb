'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Music,
  Utensils,
  Palette,
  Waves,
  Mountain,
  Camera,
  Wine,
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'festival' | 'concert' | 'exhibition' | 'sports' | 'gastronomy' | 'culture' | 'nature';
  startDate: string;
  endDate: string;
  location: string;
  distance?: string;
  price?: string;
  website?: string;
  featured?: boolean;
}

interface EventsProps {
  propertyId?: string;
  events?: Event[];
}

// Définition en-dehors du composant pour garder une référence stable
const DEFAULT_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Festival de Jazz de Juan-les-Pins',
    description: 'Le plus prestigieux festival de jazz de la Côte d\'Azur avec des artistes internationaux.',
    type: 'festival',
    startDate: '2024-07-15',
    endDate: '2024-07-25',
    location: 'Juan-les-Pins',
    distance: '25 km',
    price: 'À partir de 45€',
    website: 'https://jazzajuan.com',
    featured: true
  },
  {
    id: '2',
    title: 'Marché Provençal de Saint-Florent',
    description: 'Marché traditionnel avec produits locaux, artisanat et spécialités provençales.',
    type: 'culture',
    startDate: '2024-06-01',
    endDate: '2024-09-30',
    location: 'Place des Lices, Saint-Florent',
    distance: '2 km',
    price: 'Gratuit'
  },
  {
    id: '3',
    title: 'Exposition Picasso',
    description: 'Rétrospective exceptionnelle des œuvres de Pablo Picasso au Musée d\'Art Moderne.',
    type: 'exhibition',
    startDate: '2024-06-10',
    endDate: '2024-08-31',
    location: 'Musée d\'Art Moderne, Nice',
    distance: '65 km',
    price: '15€',
    website: 'https://mamac-nice.org'
  },
  {
    id: '4',
    title: 'Régates Royales de Cannes',
    description: 'Compétition de voiliers classiques dans la baie de Cannes.',
    type: 'sports',
    startDate: '2024-09-20',
    endDate: '2024-09-27',
    location: 'Cannes',
    distance: '35 km',
    price: 'Gratuit (spectacle)',
    featured: true
  },
  {
    id: '5',
    title: 'Fête de la Gastronomie',
    description: 'Célébration de la cuisine méditerranéenne avec des chefs étoilés.',
    type: 'gastronomy',
    startDate: '2024-07-05',
    endDate: '2024-07-07',
    location: 'Port Grimaud',
    distance: '15 km',
    price: 'À partir de 25€'
  },
  {
    id: '6',
    title: 'Randonnée des Calanques',
    description: 'Découverte guidée des calanques et de la faune méditerranéenne.',
    type: 'nature',
    startDate: '2024-06-01',
    endDate: '2024-10-31',
    location: 'Massif des Maures',
    distance: '20 km',
    price: '12€'
  }
];

export default function Events({
  propertyId = "default",
  events = DEFAULT_EVENTS
}: EventsProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  // On ne monte le composant qu'en client pour éviter les mismatch SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcul des événements filtrés, mémorisé et sans boucle infinie
  const filteredEvents = useMemo(() => {
    if (!mounted) return [];
    const now = new Date();
    const futureDate = addDays(now, 90);

    let list = events.filter(event => {
      const start = parseISO(event.startDate);
      const end   = parseISO(event.endDate);
      return isAfter(end, now) && isBefore(start, futureDate);
    });

    if (selectedType !== 'all') {
      list = list.filter(event => event.type === selectedType);
    }

    return list.sort((a, b) =>
      parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    );
  }, [events, selectedType, mounted]);

  if (!mounted) {
    return null;
  }

  if (filteredEvents.length === 0 && selectedType === 'all') {
    return null;
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'festival': return <Music className="h-5 w-5" />;
      case 'concert': return <Music className="h-5 w-5" />;
      case 'exhibition': return <Palette className="h-5 w-5" />;
      case 'sports': return <Waves className="h-5 w-5" />;
      case 'gastronomy': return <Utensils className="h-5 w-5" />;
      case 'culture': return <Camera className="h-5 w-5" />;
      case 'nature': return <Mountain className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'festival': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'concert': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'exhibition': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sports': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'gastronomy': return 'bg-red-100 text-red-800 border-red-200';
      case 'culture': return 'bg-green-100 text-green-800 border-green-200';
      case 'nature': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const eventTypes = [
    { value: 'all',       label: 'Tous les événements', icon: <Calendar className="h-4 w-4" /> },
    { value: 'festival',  label: 'Festivals',           icon: <Music className="h-4 w-4" /> },
    { value: 'exhibition',label: 'Expositions',         icon: <Palette className="h-4 w-4" /> },
    { value: 'sports',    label: 'Sports',              icon: <Waves className="h-4 w-4" /> },
    { value: 'gastronomy',label: 'Gastronomie',         icon: <Utensils className="h-4 w-4" /> },
    { value: 'culture',   label: 'Culture',             icon: <Camera className="h-4 w-4" /> },
    { value: 'nature',    label: 'Nature',              icon: <Mountain className="h-4 w-4" /> }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Événements à proximité
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez les événements culturels, festivals et activités exceptionnelles qui animent la région pendant votre séjour.
          </p>
        </motion.div>

        {/* Filtres */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {eventTypes.map(type => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 transition-all duration-300 ${
                selectedType === type.value 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
              onClick={() => setSelectedType(type.value)}
            >
              {type.icon}
              {type.label}
            </Button>
          ))}
        </motion.div>

        {/* Grille d'événements */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 overflow-hidden ${
                  event.featured ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-background' : ''
                }`}>
                  {event.featured && (
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Star className="h-4 w-4" />
                        Événement phare
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Badge 
                        variant="outline" 
                        className={`${getEventColor(event.type)} flex items-center gap-1`}
                      >
                        {getEventIcon(event.type)}
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                      {event.distance && (
                        <Badge variant="secondary" className="text-xs">
                          {event.distance}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                          {format(parseISO(event.startDate), 'dd MMM', { locale: fr })}
                          {event.startDate !== event.endDate && (
                            <> - {format(parseISO(event.endDate), 'dd MMM yyyy', { locale: fr })}</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.price && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wine className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-green-600">{event.price}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      {event.website ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          onClick={() => window.open(event.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Plus d'informations
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Détails de l'événement
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Aucun événement trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Aucun événement de ce type n'est programmé dans les prochains mois.
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedType('all')}
              >
                Voir tous les événements
              </Button>
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        {filteredEvents.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Planifiez votre séjour</h3>
                <p className="text-muted-foreground mb-6">
                  Réservez dès maintenant pour profiter de ces événements exceptionnels pendant votre séjour.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <ChevronRight className="h-5 w-5 mr-2" />
                  Voir les disponibilités
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}
