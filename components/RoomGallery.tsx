'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image';
  title: string;
  description?: string;
  isPrimary?: boolean;
  fallbackUrl?: string;
}

interface RoomImages {
  id: string;
  mainImage: MediaItem;
  relatedImages: MediaItem[];
}

interface RoomGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomImages;
}

export function RoomGallery({ isOpen, onClose, room }: RoomGalleryProps) {
  // 1. Créer la liste complète, avec l'image principale en première position
  const allImages = [room.mainImage, ...room.relatedImages];
  // 2. État pour l'index courant
  const [currentIndex, setCurrentIndex] = useState(0);

  // 3. Reset de l'index à 0 à chaque ouverture du modal
  useEffect(() => {
    console.log("ça boucle 10")
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // 4. Handlers circulaires
  const prev = () =>
    setCurrentIndex(i => (i - 1 + allImages.length) % allImages.length);
  const next = () =>
    setCurrentIndex(i => (i + 1) % allImages.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full sm:w-11/12 h-[90vh] p-6 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {allImages[currentIndex].title}
          </h2>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>

        <div className="h-full overflow-y-auto">
          {/* Main Carousel Image */}
          <div className="relative aspect-[16/9] mb-4">
            <Image
              src={allImages[currentIndex].url}
              alt={allImages[currentIndex].title}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              quality={90}
            />

            {/* Flèche gauche */}
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Flèche droite */}
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Miniatures (sans l'image principale) */}
          {room.relatedImages.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {room.relatedImages.map((thumb, idx) => {
                // Calculer l'index global dans allImages
                const globalIndex = idx + 1; // mainImage est à 0
                const isActive = globalIndex === currentIndex;
                return (
                  <button
                    key={thumb.id}
                    onClick={() => setCurrentIndex(globalIndex)}
                    className={`relative aspect-square overflow-hidden rounded-lg focus:outline-none ${
                      isActive ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <Image
                      src={thumb.url}
                      alt={thumb.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                      loading="lazy"
                    />
                    {isActive && (
                      <div className="absolute inset-0 ring-2 ring-primary rounded-lg pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
