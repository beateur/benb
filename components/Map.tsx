'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Plane, 
  Train,
  Clock,
  ExternalLink,
  Compass,
  Route
} from 'lucide-react';

interface MapProps {
  propertyId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  nearbyAttractions?: Array<{
    name: string;
    distance: string;
    type: 'restaurant' | 'beach' | 'shopping' | 'culture' | 'nature';
    description?: string;
  }>;
}

export default function Map({
  propertyId = "default",
  latitude = 43.2681,
  longitude = 6.6401,
  address = "123 Avenue de la Côte d'Azur",
  city = "Saint-Tropez",
  country = "France",
  nearbyAttractions = [
    { name: "Plage de Pampelonne", distance: "2.5 km", type: "beach", description: "Plage mythique de Saint-Tropez" },
    { name: "Port de Saint-Tropez", distance: "1.8 km", type: "culture", description: "Port historique et ses yachts" },
    { name: "Citadelle de Saint-Tropez", distance: "2.1 km", type: "culture", description: "Musée maritime" },
    { name: "Club 55", distance: "2.7 km", type: "restaurant", description: "Restaurant de plage légendaire" },
    { name: "Marché de Saint-Tropez", distance: "1.9 km", type: "shopping", description: "Marché provençal traditionnel" },
    { name: "Sentier du littoral", distance: "500 m", type: "nature", description: "Randonnée côtière" }
  ]
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getAttractionIcon = (type: string) => {
    switch (type) {
      case 'beach': return '🏖️';
      case 'restaurant': return '🍽️';
      case 'shopping': return '🛍️';
      case 'culture': return '🏛️';
      case 'nature': return '🌿';
      default: return '📍';
    }
  };

  const getAttractionColor = (type: string) => {
    switch (type) {
      case 'beach': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'restaurant': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shopping': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'culture': return 'bg-green-100 text-green-800 border-green-200';
      case 'nature': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (!mounted) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Emplacement privilégié
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez l'environnement exceptionnel de cette propriété, idéalement située au cœur de la Côte d'Azur.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 shadow-xl h-full">
              <CardContent className="p-0 h-full">
                <div className="relative h-full min-h-[600px] bg-muted">
                  {/* Map Placeholder with Loading Animation */}
                  {!mapLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"
                        />
                        <p className="text-blue-600 font-medium">Chargement de la carte...</p>
                      </div>
                    </div>
                  ) : (
                    /* Interactive Map Placeholder */
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-50">
                      {/* Simulated Map Background */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-green-200" />
                        {/* Simulated Roads */}
                        <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300 transform rotate-12" />
                        <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 transform -rotate-6" />
                        <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 transform rotate-3" />
                      </div>

                      {/* Property Marker */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <motion.div
                            className="absolute -top-2 -left-2 w-12 h-12 bg-red-500/20 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      </motion.div>

                      {/* Nearby Points */}
                      {[
                        { x: '30%', y: '40%', color: 'bg-blue-500' },
                        { x: '70%', y: '30%', color: 'bg-green-500' },
                        { x: '60%', y: '70%', color: 'bg-orange-500' },
                        { x: '25%', y: '65%', color: 'bg-purple-500' }
                      ].map((point, index) => (
                        <motion.div
                          key={index}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: point.x, top: point.y }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1 + index * 0.2 }}
                        >
                          <div className={`w-3 h-3 ${point.color} rounded-full border-2 border-white shadow-md`} />
                        </motion.div>
                      ))}

                      {/* Map Controls */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm shadow-md"
                          onClick={openInMaps}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm shadow-md"
                          onClick={getDirections}
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Address Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-foreground">{address}</p>
                                <p className="text-sm text-muted-foreground">{city}, {country}</p>
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={getDirections}>
                                    <Route className="h-3 w-3 mr-1" />
                                    Itinéraire
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={openInMaps}>
                                    <Compass className="h-3 w-3 mr-1" />
                                    Voir sur la carte
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location Info & Nearby Attractions */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Transportation */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Accès & Transport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">En voiture</p>
                    <p className="text-sm text-muted-foreground">45 min depuis Nice</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Plane className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Aéroport Nice</p>
                    <p className="text-sm text-muted-foreground">1h15 en voiture</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Train className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Gare SNCF</p>
                    <p className="text-sm text-muted-foreground">15 min à pied</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Attractions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  À proximité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearbyAttractions.map((attraction, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-2xl">{getAttractionIcon(attraction.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{attraction.name}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getAttractionColor(attraction.type)}`}
                        >
                          {attraction.distance}
                        </Badge>
                      </div>
                      {attraction.description && (
                        <p className="text-sm text-muted-foreground">{attraction.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}