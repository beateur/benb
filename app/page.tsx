'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '@/src/types/firestore';
import Hero from '@/components/Hero';
import Discovery from '@/components/Discovery';
import VillaPresentation from '@/components/VillaPresentation';
import Map from '@/components/Map';
import Events from '@/components/Events';
import Reservation from '@/components/Reservation';

function HomeContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || "default";
  const [mounted, setMounted] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ça boucle 6")
    setMounted(true);
    fetchPropertyData();
  }, [propertyId]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch property data from Firestore with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      try {
        // Dynamic import to avoid SSR issues
        const { getProperty } = await import('@/src/lib/firestore');
        const propertyDataPromise = getProperty(propertyId);
        
        const propertyData = await Promise.race([propertyDataPromise, timeoutPromise]) as Property;
        setProperty(propertyData);
      } catch (error) {
        console.log('Firebase unavailable, using default property data:', error);
        // Use default property data if Firestore fetch fails
        setProperty(null);
      }
    } catch (error) {
      console.error('Error in fetchPropertyData:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!mounted) {
    return null;
  }

  // Default property data for demo purposes
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
      {/* Hero Section */}
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

      {/* Discovery Section */}
      <Discovery
        propertyId={propertyData.id}
        title="Découvrez votre villa de luxe"
        description="Plongez dans l'univers de cette propriété d'exception à travers notre galerie immersive. Chaque espace a été pensé pour votre confort et votre bien-être."
      />

      {/* Villa Presentation Section */}
      <VillaPresentation propertyId={propertyData.id} />

      {/* Map Section */}
      <Map
        propertyId={propertyData.id}
        latitude={propertyData.location.coordinates.lat}
        longitude={propertyData.location.coordinates.lng}
        address={propertyData.location.address}
        city={propertyData.location.city}
        country={propertyData.location.country}
      />

      {/* Events Section */}
      <Events
        propertyId={propertyData.id}
      />

      {/* Reservation Section */}
      <Reservation
        propertyId={propertyData.id}
        propertyName={propertyData.name}
        pricePerNight={propertyData.pricePerNight}
        maxGuests={propertyData.maxGuests}
        amenities={propertyData.amenities}
      />

      {/* Scroll Navigation Helper */}
      <div className="fixed bottom-20 left-6 z-30 hidden lg:flex flex-col gap-2">
        {[
          { id: 'decouverte', label: 'Découverte' },
          { id: 'villa-presentation', label: 'À propos' },
          { id: 'carte', label: 'Localisation' },
          { id: 'evenements', label: 'Événements' },
          { id: 'reservation', label: 'Réservation' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="px-3 py-2 text-xs font-medium bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-border rounded-lg shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors"
            aria-label={`Aller à la section ${section.label}`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <HomeContent />
    </Suspense>
  );
}