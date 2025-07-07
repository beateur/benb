'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Send,
  ExternalLink,
  Smartphone,
  Globe
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase';

interface ContactLink {
  id: string;
  type: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'email' | 'phone' | 'website';
  label: string;
  value: string;
  isActive: boolean;
  order: number;
}

interface ContactProps {
  propertyId?: string;
}

export default function Contact({ propertyId = "default" }: ContactProps) {
  const [mounted, setMounted] = useState(false);
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ça boucle 35")
    setMounted(true);
    fetchContactLinks();
  }, []);

  const fetchContactLinks = async () => {
    try {
      const contactRef = collection(db, 'settings');
      const snapshot = await getDocs(contactRef);
      
      const links: ContactLink[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category === 'contact' && data.isActive) {
          links.push({
            id: doc.id,
            type: data.type,
            label: data.label,
            value: data.value,
            isActive: data.isActive,
            order: data.order || 0
          });
        }
      });

      // Sort by order
      links.sort((a, b) => a.order - b.order);
      setContactLinks(links);
    } catch (error) {
      console.error('Error fetching contact links:', error);
      // Fallback to default links
      setContactLinks(defaultContactLinks);
    } finally {
      setLoading(false);
    }
  };

  const defaultContactLinks: ContactLink[] = [
    {
      id: '1',
      type: 'whatsapp',
      label: 'WhatsApp',
      value: '+33612345678',
      isActive: true,
      order: 1
    },
    {
      id: '2',
      type: 'instagram',
      label: 'Instagram',
      value: 'La Villa Roya',
      isActive: true,
      order: 2
    },
    {
      id: '3',
      type: 'email',
      label: 'Email',
      value: 'agduval77@gmail.com',
      isActive: true,
      order: 3
    },
    {
      id: '4',
      type: 'phone',
      label: 'Téléphone',
      value: '+33123456789',
      isActive: true,
      order: 4
    }
  ];

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'email': return <Mail className="h-5 w-5" />;
      case 'phone': return <Phone className="h-5 w-5" />;
      case 'website': return <Globe className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white';
      case 'facebook': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'twitter': return 'bg-sky-500 hover:bg-sky-600 text-white';
      case 'email': return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'phone': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'website': return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      default: return 'bg-primary hover:bg-primary/90 text-primary-foreground';
    }
  };

  const getContactUrl = (type: string, value: string) => {
    switch (type) {
      case 'whatsapp':
        const cleanNumber = value.replace(/\D/g, '');
        return `https://wa.me/${cleanNumber}?text=Bonjour, je suis intéressé par vos propriétés de vacances.`;
      case 'instagram':
        return `https://instagram.com/${value.replace('@', '')}`;
      case 'facebook':
        return `https://facebook.com/${value}`;
      case 'twitter':
        return `https://twitter.com/${value.replace('@', '')}`;
      case 'email':
        return `mailto:${value}?subject=Demande d'information - Location de vacances`;
      case 'phone':
        return `tel:${value}`;
      case 'website':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return value;
    }
  };

  const handleContactClick = (link: ContactLink) => {
    const url = getContactUrl(link.type, link.value);
    
    if (link.type === 'email' || link.type === 'phone') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, link: ContactLink) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleContactClick(link);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-background to-muted/20">
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
            Contactez-nous
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre projet de vacances.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 overflow-hidden"
                    onClick={() => handleContactClick(link)}
                    onKeyDown={(e) => handleKeyDown(e, link)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Contacter via ${link.label}: ${link.value}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${getContactColor(link.type)} transition-all duration-300 group-hover:scale-110`}>
                          {getContactIcon(link.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {link.label}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {link.type === 'whatsapp' || link.type === 'phone' ? link.value : 
                             link.type === 'email' ? link.value :
                             `@${link.value.replace('@', '')}`}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Business Hours */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-medium">Lundi - Vendredi</span>
                  <span className="text-muted-foreground">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-medium">Samedi</span>
                  <span className="text-muted-foreground">9h00 - 16h00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Dimanche</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Fermé
                  </Badge>
                </div>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Service d'urgence 24h/7j</strong> disponible pour nos clients en séjour
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Contact & Location */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Quick WhatsApp Contact */}
            {contactLinks.find(link => link.type === 'whatsapp') && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 animate-pulse">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">
                      Contact immédiat
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      Obtenez une réponse rapide via WhatsApp
                    </p>
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleContactClick(contactLinks.find(link => link.type === 'whatsapp')!)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chatter maintenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Office Location */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Notre bureau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">La Villa Roya</p>
                  <address className="text-sm text-muted-foreground not-italic">
                    123 Avenue des Champs-Élysées<br />
                    75008 Paris, France
                  </address>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://maps.google.com/?q=123+Avenue+des+Champs-Élysées+75008+Paris+France', '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Voir sur la carte
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                    Temps de réponse
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">WhatsApp:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        &lt; 5 min
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Email:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        &lt; 2h
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Téléphone:</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        Immédiat
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating Contact Buttons */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          {contactLinks.slice(0, 2).map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, scale: 0, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.2, type: "spring", stiffness: 200 }}
            >
              <Button
                size="lg"
                className={`rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${getContactColor(link.type)}`}
                onClick={() => handleContactClick(link)}
                onKeyDown={(e) => handleKeyDown(e, link)}
                aria-label={`Contact rapide via ${link.label}`}
              >
                {getContactIcon(link.type)}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}