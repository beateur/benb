'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Download,
  Share2,
  Play,
  Maximize,
  Eye,
  Camera,
  Video,
  VolumeX,
  Volume2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | '360';
  title: string;
  description?: string;
  thumbnail?: string;
}

interface DiscoveryProps {
  propertyId?: string;
  title?: string;
  description?: string;
  mediaItems?: MediaItem[];
}

export default function Discovery({
  propertyId = "default",
  title = "Découvrez votre refuge de luxe",
  description = "Plongez dans l'univers de cette propriété d'exception à travers notre galerie immersive. Chaque espace a été pensé pour votre confort et votre bien-être.",
  mediaItems = [
    {
      id: '1',
      url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      type: 'image',
      title: 'Vue extérieure',
      description: 'Façade principale avec piscine'
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      type: 'image',
      title: 'Salon principal',
      description: 'Espace de vie avec vue panoramique'
    },
    {
      id: '3',
      url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      type: 'image',
      title: 'Cuisine moderne',
      description: 'Équipement haut de gamme'
    },
    {
      id: '4',
      url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      type: 'image',
      title: 'Chambre master',
      description: 'Suite parentale avec dressing'
    },
    {
      id: '5',
      url: 'https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      type: 'image',
      title: 'Salle de bain',
      description: 'Marbre italien et baignoire spa'
    },
    {
      id: '6',
      url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      type: 'image',
      title: 'Terrasse',
      description: 'Espace détente avec vue mer'
    }
  ]
}: DiscoveryProps) {
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [videoMuted, setVideoMuted] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleImageLoad = (id: string) => {
    setIsLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleImageLoadStart = (id: string) => {
    setIsLoading(prev => ({ ...prev, [id]: true }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return null;
  }

  const currentItem = mediaItems[currentIndex];

  return (
    <section id="decouverte" className="py-20 bg-gradient-to-b from-background to-muted/20">
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
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Main Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mediaItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative group cursor-pointer ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                <CardContent className="p-0 relative">
                  {/* Image Container */}
                  <div className={`relative overflow-hidden ${
                    index === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'
                  }`}>
                    {/* Loading Skeleton */}
                    {isLoading[item.id] && (
                      <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}
                    
                    {/* Image */}
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onLoadStart={() => handleImageLoadStart(item.id)}
                      onLoad={() => handleImageLoad(item.id)}
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Media Type Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm">
                        {item.type === 'image' && <Camera className="h-3 w-3 mr-1" />}
                        {item.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                        {item.type === '360' && <Eye className="h-3 w-3 mr-1" />}
                        {item.type === 'image' ? 'Photo' : item.type === 'video' ? 'Vidéo' : 'Visite 360°'}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white border-0 backdrop-blur-sm hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare();
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white border-0 backdrop-blur-sm hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.url, `${item.title}.jpg`);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Zoom Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="lg"
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30"
                        onClick={() => openLightbox(index)}
                      >
                        {item.type === 'video' ? (
                          <Play className="h-6 w-6 mr-2" />
                        ) : item.type === '360' ? (
                          <Maximize className="h-6 w-6 mr-2" />
                        ) : (
                          <ZoomIn className="h-6 w-6 mr-2" />
                        )}
                        {item.type === 'video' ? 'Lire' : item.type === '360' ? 'Explorer' : 'Agrandir'}
                      </Button>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Media Viewer</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Media Content */}
            <div className="w-full h-full flex items-center justify-center p-8">
              {currentItem?.type === 'video' ? (
                <div className="relative max-w-full max-h-full">
                  <video
                    src={currentItem.url}
                    className="max-w-full max-h-full object-contain"
                    controls
                    muted={videoMuted}
                    autoPlay
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-4 right-4 text-white hover:bg-white/20"
                    onClick={() => setVideoMuted(!videoMuted)}
                  >
                    {videoMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>
              ) : (
                <img
                  src={currentItem?.url}
                  alt={currentItem?.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{currentItem?.title}</h3>
                  {currentItem?.description && (
                    <p className="text-white/80">{currentItem.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">
                    {currentIndex + 1} / {mediaItems.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}