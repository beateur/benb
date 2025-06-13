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
  title?: string;
  subtitle?: string;
  location?: string;
  maxGuests?: number;
}

export default function Hero({
  propertyId = "default",
  coverImageUrl = "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  title = "Villa Méditerranéenne d'Exception",
  subtitle = "Luxe, confort et vue panoramique sur la Côte d'Azur",
  location = "Saint-Tropez, France",
  maxGuests = 8
}: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effect
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
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
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div 
          className="w-full h-[120%] bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${coverImageUrl})`,
            filter: 'brightness(0.7)'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </motion.div>

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
            className="border-white/30 text-white hover:bg-white hover:text-black text-lg px-8 py-6 h-auto font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
            onClick={() => scrollToSection('reservation')}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Réserver maintenant
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="cursor-pointer"
            onClick={() => scrollToSection('decouverte')}
          >
            <div className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
              <span className="text-sm font-medium">Découvrir</span>
              <ChevronDown className="h-6 w-6" />
            </div>
          </motion.div>
        </motion.div>
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