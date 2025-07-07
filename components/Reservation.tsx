'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  Users, 
  Mail, 
  Phone, 
  User,
  CreditCard,
  Shield,
  Check,
  Star,
  MapPin,
  Clock,
  Wifi,
  Car,
  Coffee,
  Waves,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { toast } from 'sonner';

// Form validation schema
const reservationSchema = z.object({
  guestName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  guestEmail: z.string().email('Adresse email invalide'),
  guestPhone: z.string().min(10, 'Numéro de téléphone invalide'),
  numberOfGuests: z.number().min(1, 'Au moins 1 personne').max(12, 'Maximum 12 personnes'),
  specialRequests: z.string().optional()
});

type ReservationForm = z.infer<typeof reservationSchema>;

interface ReservationProps {
  propertyId?: string;
  propertyName?: string;
  pricePerNight?: number;
  maxGuests?: number;
  unavailableDates?: Date[];
  amenities?: string[];
}

export default function Reservation({
  propertyId = "default",
  propertyName = "Villa Méditerranéenne d'Exception",
  pricePerNight = 450,
  maxGuests = 8,
  unavailableDates = [
    new Date(2024, 6, 15), // July 15
    new Date(2024, 6, 16), // July 16
    new Date(2024, 6, 17), // July 17
    new Date(2024, 7, 5),  // August 5
    new Date(2024, 7, 6),  // August 6
  ],
  amenities = ['Piscine privée', 'WiFi gratuit', 'Parking', 'Climatisation', 'Vue mer', 'Cuisine équipée']
}: ReservationProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [reservationId, setReservationId] = useState<string>('');
  
  // Variables temporaires pour la confirmation
  const [tempBookingData, setTempBookingData] = useState<{
    nights: number;
    numberOfGuests: number;
    total: number;
    selectedRange?: { from?: Date; to?: Date };
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      numberOfGuests: 2
    }
  });

  useEffect(() => {
    console.log("ça boucle 38")
    setMounted(true);
    
    // ✅ Test de connectivité Firebase
    const testFirebaseConnection = async () => {
      try {
        console.log('🔄 Test de connexion Firebase...');
        const testRef = collection(db, 'test');
        const testDoc = await addDoc(testRef, { test: true, timestamp: new Date() });
        console.log('✅ Firebase connecté, document test créé:', testDoc.id);
      } catch (error: any) {
        console.error('❌ Erreur de connexion Firebase:', error);
      }
    };
    
    testFirebaseConnection();
  }, []);

  const numberOfGuests = watch('numberOfGuests');

  // Calculate pricing
  const nights = selectedRange?.from && selectedRange?.to 
    ? differenceInDays(selectedRange.to, selectedRange.from)
    : 0;
  
  const subtotal = nights * pricePerNight;
  const cleaningFee = 200;
  const touristTax = nights * numberOfGuests * 2; // 2€ par personne par nuit (taxe de séjour)
  const total = subtotal + cleaningFee + touristTax;

  // Check if date is unavailable
  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      date.toDateString() === unavailableDate.toDateString()
    );
  };

  // Convert range to DateRange for DayPicker
  const getSelectedForDayPicker = (): DateRange | undefined => {
    if (selectedRange?.from && selectedRange?.to) {
      return { from: selectedRange.from, to: selectedRange.to };
    }
    if (selectedRange?.from) {
      return { from: selectedRange.from, to: selectedRange.from };
    }
    return undefined;
  };

  // Handle date selection
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    console.log('📅 Date sélectionnée:', range);
    setSelectedRange(range);
  };

  // Handle form submission
  const onSubmit = async (data: ReservationForm) => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast.error('Veuillez sélectionner vos dates de séjour');
      return;
    }

    if (nights < 1) {
      toast.error('Le séjour doit durer au moins une nuit');
      return;
    }

    setIsSubmitting(true);

    try {
      // 💾 Sauvegarder les données avant le reset
      const bookingData = {
        nights,
        numberOfGuests: data.numberOfGuests,
        total,
        selectedRange: { ...selectedRange }
      };

      const reservationData = {
        propertyId,
        userId: 'guest', // Pour les réservations sans compte
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        numberOfGuests: data.numberOfGuests,
        checkInDate: selectedRange.from,
        checkOutDate: selectedRange.to,
        totalNights: nights,
        pricePerNight,
        totalPrice: total,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: data.specialRequests || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🔄 Tentative de création de réservation:', reservationData);
      
      const docRef = await addDoc(collection(db, 'reservations'), reservationData);
      
      console.log('✅ Réservation créée avec succès:', docRef.id);
      
      setReservationId(docRef.id);
      setTempBookingData(bookingData); // 💾 Sauvegarder pour la modal
      setConfirmationOpen(true);
      
      // Reset après sauvegarde
      reset();
      setSelectedRange(undefined);
      
    } catch (error: any) {
      console.error('❌ Erreur détaillée lors de la création:', error);
      
      if (error?.code === 'permission-denied') {
        toast.error('Permissions insuffisantes. Veuillez vous connecter ou contacter le support.');
      } else if (error?.code === 'unavailable') {
        toast.error('Service temporairement indisponible. Veuillez réessayer.');
      } else if (error?.message?.includes('offline')) {
        toast.error('Connexion interrompue. Vérifiez votre connexion internet.');
      } else {
        toast.error(`Erreur: ${error?.message || 'Erreur inconnue'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenityIcons: { [key: string]: any } = {
    'Piscine privée': <Waves className="h-4 w-4" />,
    'WiFi gratuit': <Wifi className="h-4 w-4" />,
    'Parking': <Car className="h-4 w-4" />,
    'Climatisation': <Coffee className="h-4 w-4" />,
    'Vue mer': <MapPin className="h-4 w-4" />,
    'Cuisine équipée': <Coffee className="h-4 w-4" />
  };

  if (!mounted) {
    return null;
  }

  return (
    <section id="reservation" className="py-20 bg-muted/30">
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
            Réservez votre séjour
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sélectionnez vos dates et réservez cette propriété d'exception pour des vacances inoubliables.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Booking Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6 text-primary" />
                  Sélectionnez vos dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Date Picker */}
                <div className="w-full">
                  <DayPicker
                    mode="range"
                    selected={getSelectedForDayPicker()}
                    onSelect={handleDateSelect}
                    disabled={[
                      { before: new Date() },
                      ...unavailableDates
                    ]}
                    locale={fr}
                    numberOfMonths={2}
                    className="w-full"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                      month: "space-y-4 flex-1",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                    styles={{
                      months: { width: '100%' },
                      month: { width: '100%' },
                      table: { width: '100%' },
                      head_row: { width: '100%' },
                      row: { width: '100%' }
                    }}
                  />
                </div>

                {/* Selected Dates Display */}
                {selectedRange?.from && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">Dates sélectionnées</p>
                        <p className="text-sm text-muted-foreground">
                          {format(selectedRange.from, 'dd MMMM yyyy', { locale: fr })}
                          {selectedRange?.to && (
                            <> - {format(selectedRange.to, 'dd MMMM yyyy', { locale: fr })}</>
                          )}
                        </p>
                      </div>
                      {nights > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {nights} nuit{nights > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Guest Information Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Informations des voyageurs
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guestName">Nom complet *</Label>
                        <Input
                          id="guestName"
                          {...register('guestName')}
                          placeholder="Jean Dupont"
                          className="mt-1"
                        />
                        {errors.guestName && (
                          <p className="text-sm text-red-500 mt-1">{errors.guestName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="numberOfGuests">Nombre de personnes *</Label>
                        <Input
                          id="numberOfGuests"
                          type="number"
                          min="1"
                          max={maxGuests}
                          {...register('numberOfGuests', { valueAsNumber: true })}
                          className="mt-1"
                        />
                        {errors.numberOfGuests && (
                          <p className="text-sm text-red-500 mt-1">{errors.numberOfGuests.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="guestEmail">Email *</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          {...register('guestEmail')}
                          placeholder="jean.dupont@email.com"
                          className="mt-1"
                        />
                        {errors.guestEmail && (
                          <p className="text-sm text-red-500 mt-1">{errors.guestEmail.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="guestPhone">Téléphone *</Label>
                        <Input
                          id="guestPhone"
                          type="tel"
                          {...register('guestPhone')}
                          placeholder="+33 6 12 34 56 78"
                          className="mt-1"
                        />
                        {errors.guestPhone && (
                          <p className="text-sm text-red-500 mt-1">{errors.guestPhone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="specialRequests">Demandes spéciales (optionnel)</Label>
                      <textarea
                        id="specialRequests"
                        {...register('specialRequests')}
                        placeholder="Arrivée tardive, allergies alimentaires, etc."
                        className="mt-1 w-full p-3 border border-input rounded-md resize-none h-20"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!selectedRange?.from || !selectedRange?.to || nights < 1 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Réserver maintenant
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Property Summary */}
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Property Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{propertyName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>Jusqu'à {maxGuests} personnes</span>
                    </div>
                    
                    {/* Amenities */}
                    <div className="grid grid-cols-2 gap-2">
                      {amenities.slice(0, 6).map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {amenityIcons[amenity] || <Check className="h-4 w-4" />}
                          <span className="truncate">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  {nights > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Détail des prix</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{pricePerNight}€ TTC × {nights} nuit{nights > 1 ? 's' : ''}</span>
                          <span>{subtotal}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de ménage</span>
                          <span>{cleaningFee}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxe de séjour ({numberOfGuests} pers. × {nights} nuits)</span>
                          <span>{touristTax}€</span>
                        </div>
                      </div>

                      {/* Encadré informatif taxe de séjour */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">À propos de la taxe de séjour</p>
                            <p className="text-xs leading-relaxed">
                              Taxe municipale obligatoire collectée pour le compte de la commune de Saint-Florent. 
                              <strong> 2€ par personne et par nuit</strong>, conformément à la réglementation française. 
                              Les enfants de moins de 18 ans en sont exemptés.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{total}€</span>
                      </div>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                          Réservation sécurisée
                        </p>
                        <p className="text-green-700 dark:text-green-300">
                          Vos informations sont protégées et votre paiement est sécurisé.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Politique d'annulation</p>
                    <p>Annulation gratuite jusqu'à 48h avant l'arrivée. Consultez les conditions complètes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-6 w-6" />
              Réservation confirmée !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Votre réservation a été créée avec succès. Vous recevrez un email de confirmation sous peu.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numéro de réservation :</span>
                <span className="font-mono">{reservationId.slice(-8).toUpperCase()}</span>
              </div>
              {tempBookingData?.selectedRange?.from && tempBookingData?.selectedRange?.to && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrivée :</span>
                    <span>{format(tempBookingData.selectedRange.from, 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Départ :</span>
                    <span>{format(tempBookingData.selectedRange.to, 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée :</span>
                    <span>{tempBookingData.nights} nuit{tempBookingData.nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personnes :</span>
                    <span>{tempBookingData.numberOfGuests}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total :</span>
                <span>{tempBookingData?.total || total}€</span>
              </div>
            </div>

            <Button 
              onClick={() => setConfirmationOpen(false)}
              className="w-full"
            >
              Parfait !
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}