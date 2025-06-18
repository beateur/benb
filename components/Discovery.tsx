'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RoomGallery } from './RoomGallery';
import Image from './Image';

interface MediaItem {
  id: string;
  url: string;
  type: 'image';
  title: string;
  description?: string;
  isPrimary?: boolean;
  // On récupère automatiquement le PNG en remplaçant .avif par .png
  fallbackUrl?: string;
}

interface RoomImages {
  id: string;
  mainImage: MediaItem;
  relatedImages: MediaItem[];
}

interface DiscoveryProps {
  propertyId?: string;
  title?: string;
  description?: string;
}

const getRoomImages = (): { [key: string]: RoomImages } => {
  // On utilise le chemin relatif des assets
  const imagesPath = '/assets/images';

  const generateImageUrls = (baseName: string) => ({
    url: `${imagesPath}/${baseName}.avif`,
    fallbackUrl: `${imagesPath}/${baseName}.png`
  });
  
  return {
    exterieur: {
      id: 'exterieur',
      mainImage: {
        id: 'exterieur-vue-principale',
        ...generateImageUrls('exterieur-vue-principale'),
        type: 'image',
        title: 'Vue Extérieure',
        description: 'Vue panoramique de la propriété',
        isPrimary: true
      },
      relatedImages: [
        {
          id: 'exterieur-vue-principale',
          ...generateImageUrls('exterieur-vue-principale'),
          type: 'image',
          title: 'Vue principale extérieure'
        },
        {
          id: 'exterieur-terrasse',
          ...generateImageUrls('exterieur-terrasse'),
          type: 'image',
          title: 'Terrasse extérieure'
        },
        {
          id: 'exterieur-terrasse-2',
          ...generateImageUrls('exterieur-terrasse-2'),
          type: 'image',
          title: 'Terrasse - Vue 2'
        },
        {
          id: 'exterieur-terrasse-rooftop',
          ...generateImageUrls('exterieur-terrasse-rooftop'),
          type: 'image',
          title: 'Terrasse rooftop'
        },
        {
          id: 'exterieur-terrasse-bis',
          ...generateImageUrls('exterieur-terrasse-bis'),
          type: 'image',
          title: 'Terrasse - Vue alternative'
        },
        {
          id: 'vue-exterieur-montagnes',
          ...generateImageUrls('vue-exterieur-montagnes'),
          type: 'image',
          title: 'Vue sur les montagnes'
        }
      ]
    },
    salon: {
      id: 'salon',
      mainImage: {
        id: 'salon-principale-02',
        ...generateImageUrls('salon-principale-02'),
        type: 'image',
        title: 'Salon Principal',
        description: 'Espace de vie spacieux et lumineux',
        isPrimary: true
      },
      relatedImages: [
        {
          id: 'salon-01',
          ...generateImageUrls('salon-01'),
          type: 'image',
          title: 'Salon - Vue 1'
        },
        {
          id: 'salon-03',
          ...generateImageUrls('salon-03'),
          type: 'image',
          title: 'Salon - Vue 2'
        },
        {
          id: 'salon-04',
          ...generateImageUrls('salon-04'),
          type: 'image',
          title: 'Salon - Vue 3'
        },
        {
          id: 'salon-05',
          ...generateImageUrls('salon-05'),
          type: 'image',
          title: 'Salon - Vue 4'
        }
      ]
    },
    cuisine: {
      id: 'cuisine',
      mainImage: {
        id: 'cuisine-principal-01',
        ...generateImageUrls('cuisine-principal-01'),
        type: 'image',
        title: 'Cuisine équipée',
        description: 'Équipements haut de gamme et design',
        isPrimary: true
      },
      relatedImages: [
        {
          id: 'cuisine-02',
          ...generateImageUrls('cuisine-02'),
          type: 'image',
          title: 'Cuisine - Détails'
        },
        {
          id: 'cuisine-03',
          ...generateImageUrls('cuisine-03'),
          type: 'image',
          title: 'Cuisine - Équipements'
        }
      ]
    },
    piscine: {
      id: 'piscine',
      mainImage: {
        id: 'piscine-principale-bis',
        ...generateImageUrls('piscine-principale-bis'),
        type: 'image',
        title: 'Piscine',
        description: 'Détente et rafraîchissement en toute intimité',
        isPrimary: true
      },
      relatedImages: [
        {
          id: 'piscine-01',
          ...generateImageUrls('piscine-01'),
          type: 'image',
          title: 'Piscine - Vue d\'ensemble'
        },
        {
          id: 'piscine-04',
          ...generateImageUrls('piscine-04'),
          type: 'image',
          title: 'Piscine - Vue 4'
        },
        {
          id: 'piscine-05',
          ...generateImageUrls('piscine-05'),
          type: 'image',
          title: 'Piscine - Vue 5'
        },
        {
          id: 'piscine-principale-01',
          ...generateImageUrls('piscine-principale-01'),
          type: 'image',
          title: 'Piscine - Vue alternative'
        }
      ]
    },
    chambre: {
      id: 'chambre',
      mainImage: {
        id: 'chambre-principale-01',
        ...generateImageUrls('chambre-principale-01'),
        type: 'image',
        title: 'Chambre Principale',
        description: 'Suite parentale spacieuse',
        isPrimary: true
      },
      relatedImages: [
        {
          id: 'chambre-02',
          ...generateImageUrls('chambre-02'),
          type: 'image',
          title: 'Chambre - 2'
        },
        {
          id: 'chambre-03-terrasse',
          ...generateImageUrls('chambre-03-terrasse'),
          type: 'image',
          title: 'Chambre - Terrasse'
        },
        {
          id: 'chambre-03',
          ...generateImageUrls('chambre-03'),
          type: 'image',
          title: 'Chambre - Vue 3'
        },
        {
          id: 'chambre-05',
          ...generateImageUrls('chambre-05'),
          type: 'image',
          title: 'Chambre - 4'
        },
        {
          id: 'chambre-06',
          ...generateImageUrls('chambre-06'),
          type: 'image',
          title: 'Chambre - '
        }
      ]
    },
    'salle-de-bain': {
      id: 'salle-de-bain',
      mainImage: {
        id: 'salle-de-bain-principale-01',
        ...generateImageUrls('salle-de-bain-principale-01'),
        type: 'image',
        title: 'Salle de Bain',
        description: 'Salle de bain moderne et équipée',
        isPrimary: true
      },
      relatedImages: [
        {
          id: 'salle-de-bain-02',
          ...generateImageUrls('salle-de-bain-02'),
          type: 'image',
          title: 'Salle de Bain - Vue 1'
        },
        {
          id: 'salle-de-bain-03',
          ...generateImageUrls('salle-de-bain-03'),
          type: 'image',
          title: 'Salle de Bain - Vue 2'
        }
      ]
    }
  };
};

export default function Discovery({ 
  propertyId,
  title = "Découvrez notre propriété",
  description 
}: DiscoveryProps = {}) {
  const [selectedRoom, setSelectedRoom] = useState<RoomImages | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const roomData = getRoomImages();
  const rooms = Object.values(roomData);

  const openGallery = (room: RoomImages) => {
    setSelectedRoom(room);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div id="decouverte" className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
      
      {/* Main Grid - Principal Images Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            className={cn(
              "relative overflow-hidden rounded-lg cursor-pointer group",
              index === 0 ? "md:col-span-2 md:row-span-2 aspect-[16/9]" : "aspect-[4/3]"
            )}
            onClick={() => openGallery(room)}
          >
            <Image
              src={room.mainImage.url}
              fallbackUrl={room.mainImage.fallbackUrl}
              alt={room.mainImage.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              priority={index < 4} // Charger prioritairement les 4 premières images
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-xl font-semibold mb-2">{room.mainImage.title}</h3>
                <p className="text-sm">{`${room.relatedImages.length + 1} photos`}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Gallery Modal */}
      {selectedRoom && (
        <RoomGallery
          isOpen={isGalleryOpen}
          onClose={closeGallery}
          room={selectedRoom}
        />
      )}
    </div>
  );
}