'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Property } from '@/src/types/firestore';
import Hero from '@/components/Hero';
import Discovery from '@/components/Discovery';
import VillaPresentation from '@/components/VillaPresentation';

// Lazy load des composants lourds avec placeholders
const Map = dynamic(() => import('@/components/Map'), {
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
  ssr: false,
});

const Events = dynamic(() => import('@/components/Events'), {
  loading: () => (
    <div className="min-h-[400px] bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Chargement des événements...</p>
    </div>
  ),
});

const Reservation = dynamic(() => import('@/components/Reservation'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Chargement du système de réservation...</p>
    </div>
  ),
});

function HomeContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || "default";
  const [mounted, setMounted] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      try {
        const { getProperty } = await import('@/src/lib/firestore');
        const propertyDataPromise = getProperty(propertyId);
        
        const propertyData = await Promise.race([propertyDataPromise, timeoutPromise]) as Property;
        setProperty(propertyData);
      } catch (error) {
        console.log('Firebase unavailable, using default property data:', error);
        setProperty(null);
      }
    } catch (error) {
      console.error('Error in fetchPropertyData:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ça boucle 6")
    setMounted(true);
    fetchPropertyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  if (!mounted) {
    return null;
  }

  const defaultPropertyData = {
    id: propertyId,
    name: "La Villa Roya",
    description: "Luxe, confort et vue panoramique sur le Golfe de Saint-Florent",
    type: 'villa' as const,
    status: 'active' as const,
    location: {
      address: "Route de Casta",
      city: "Saint-Florent",
      country: "France",
      coordinates: {
        lat: 42.6701,
        lng: 9.2905
      }
    },
    pricePerNight: 1027,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 5,
    area: 250,
    images: [
      "assets/images/CoverHero.avif",
    ],
    videos: [
      "/assets/images/Hero-video.mp4",
    ],
    mediaType: 'video' as const,
    amenities: ['Piscine privée', 'WiFi gratuit', 'Parking', 'Climatisation', 'Vue mer', 'Cuisine équipée'],
    rules: ['Non fumeur', 'Animaux non autorisés'],
    checkInTime: '16:00',
    checkOutTime: '11:00',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const propertyData = property || defaultPropertyData;

  return (
    <div className="min-h-screen">
      <Hero
        propertyId={propertyData.id}
        coverImageUrl={propertyData.images?.[0]}
        coverVideoUrl={propertyData.videos?.[0]}
        mediaType={propertyData.mediaType}
        title={propertyData.name}
        subtitle={propertyData.description}
        location={`${propertyData.location.city}, ${propertyData.location.country}`}
        maxGuests={propertyData.maxGuests}
      />

      <Discovery
        propertyId={propertyData.id}
        title="Découvrez votre villa de luxe"
        description="Plongez dans l'univers de cette propriété d'exception à travers notre galerie immersive. Chaque espace a été pensé pour votre confort et votre bien-être."
      />

      <VillaPresentation propertyId={propertyData.id} />

      <Map
        propertyId={propertyData.id}
        latitude={propertyData.location.coordinates.lat}
        longitude={propertyData.location.coordinates.lng}
        address={propertyData.location.address}
        city={propertyData.location.city}
        country={propertyData.location.country}
      />

      <Events
        propertyId={propertyData.id}
      />

      <Reservation
        propertyId={propertyData.id}
        propertyName={propertyData.name}
        pricePerNight={propertyData.pricePerNight}
        maxGuests={propertyData.maxGuests}
        amenities={propertyData.amenities}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <HomeContent />
    </Suspense>
  );
}
