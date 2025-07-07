'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  MapPin, 
  Users, 
  Calendar,
  Play,
  Heart
} from 'lucide-react';

interface HeroProps {
  propertyId?: string;
  coverImageUrl?: string;
  coverVideoUrl?: string; // Ajout support vidéo
  mediaType?: 'image' | 'video'; // Type de média
  title?: string;
  subtitle?: string;
  location?: string;
  maxGuests?: number;
}

// Composant BackgroundMedia pour gérer image/vidéo
interface BackgroundMediaProps {
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  y: any;
  opacity: any;
  title: string;
}

function BackgroundMedia({ mediaType, imageUrl, videoUrl, y, opacity, title }: BackgroundMediaProps) {
  if (mediaType === 'video' && videoUrl) {
    return (
      <motion.div 
        className="absolute inset-0"
        style={{ y, opacity }}
      >
        <video
          ref={(video) => {
            if (video) {
              // Force la lecture après le mount
              video.play().catch((error) => {
                console.error('Autoplay prevented:', error);
                // Essayer de lancer la lecture au premier clic utilisateur
                const playOnInteraction = () => {
                  video.play().then(() => {
                    console.log('Video started playing after user interaction');
                    document.removeEventListener('click', playOnInteraction);
                  });
                };
                document.addEventListener('click', playOnInteraction);
              });
            }
          }}
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Video error:', e, 'URL:', videoUrl);
            const error = (e.target as HTMLVideoElement).error;
            console.error('Error details:', error?.code, error?.message);
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        {/* Image de fallback en arrière-plan */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </motion.div>
    );
  }
  
  // Mode image par défaut
  return (
    <motion.div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        y,
        opacity
      }}
    />
  );
}

export default function Hero({
  propertyId = "default",
  coverImageUrl = "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  coverVideoUrl,
  mediaType = 'image',
  title = "La ",
  subtitle = "Luxe, confort et vue panoramique sur le Golfe de Saint-Florent",
  location = "Saint-Florent, France",
  maxGuests = 8
}: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [isScrollIndicatorVisible, setIsScrollIndicatorVisible] = useState(true);
  const { scrollY } = useScroll();
  
  // Parallax effect
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Effet pour gérer la visibilité du bouton de découverte
  useEffect(() => {
    console.log("ça boucle 8")
    const handleScroll = () => {
      // Faire disparaître dès qu'on scrolle (position > 0)
      setIsScrollIndicatorVisible(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Vérifier la position initiale

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    console.log("ça boucle 9")
    setMounted(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const features = [
    { icon: <Users className="h-4 w-4" />, text: `Jusqu'à ${maxGuests} personnes` },
    { icon: <MapPin className="h-4 w-4" />, text: location }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Media with Parallax */}
      <BackgroundMedia
        mediaType={mediaType}
        imageUrl={coverImageUrl}
        videoUrl={coverVideoUrl}
        y={y}
        opacity={opacity}
        title={title}
      />

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto"
        style={{ opacity }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Main Title */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {subtitle}
        </motion.p>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-white/80">
                {feature.icon}
              </div>
              <span className="text-sm font-medium text-white/90">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300 hover:scale-105"
            onClick={() => scrollToSection('decouverte')}
          >
            <Play className="h-5 w-5 mr-2" />
            Découvrir la propriété
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-white text-black border-white text-lg px-8 py-6 h-auto font-semibold backdrop-blur-sm"
            onClick={() => scrollToSection('reservation')}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Réserver maintenant
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        {isScrollIndicatorVisible && (
          <motion.div
            className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full"
              onClick={() => {
                scrollToSection('decouverte');
              }}
            >
              <div className="flex flex-col items-center gap-2 text-white/90 hover:text-white transition-colors">
                <span className="text-sm font-medium">Découvrir</span>
                <ChevronDown className="h-6 w-6" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => {/* Add to favorites logic */}}
        >
          <Heart className="h-6 w-6" />
        </Button>
      </motion.div>
    </section>
  );
}