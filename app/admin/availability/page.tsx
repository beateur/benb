'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure moment for French locale
moment.locale('fr');
const localizer = momentLocalizer(moment);

interface AvailabilityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'blocked' | 'maintenance' | 'reserved' | 'special_rate';
  price?: number;
  notes?: string;
  color?: string;
}

interface BlockingForm {
  title: string;
  start: Date;
  end: Date;
  type: 'blocked' | 'maintenance' | 'special_rate';
  price?: number;
  notes?: string;
}

export default function AvailabilityPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('default');
  const [events, setEvents] = useState<AvailabilityEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AvailabilityEvent | null>(null);
  const [formData, setFormData] = useState<BlockingForm>({
    title: '',
    start: new Date(),
    end: new Date(),
    type: 'blocked',
    notes: ''
  });

  useEffect(() => {
    console.log("ça boucle 12")
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("ça boucle 13")
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
            console.log("ça boucle 14")

    if (mounted && user && isAdmin) {
      fetchAvailabilityEvents();
    }
  }, [mounted, user, isAdmin, selectedProperty, currentDate]);

  const fetchAvailabilityEvents = async () => {
    try {
      setLoadingEvents(true);
      
      // Get start and end of current month view
      const startOfMonth = moment(currentDate).startOf('month').subtract(1, 'week').toDate();
      const endOfMonth = moment(currentDate).endOf('month').add(1, 'week').toDate();
      
      // Fetch availability data from Firestore
      const availabilityRef = collection(db, 'availability');
      const q = query(
        availabilityRef,
        where('propertyId', '==', selectedProperty)
      );
      
      const snapshot = await getDocs(q);
      const fetchedEvents: AvailabilityEvent[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const startDate = data.startDate?.toDate();
        const endDate = data.endDate?.toDate();
        
        if (startDate && endDate) {
          fetchedEvents.push({
            id: doc.id,
            title: data.title || 'Période bloquée',
            start: startDate,
            end: endDate,
            type: data.type || 'blocked',
            price: data.price,
            notes: data.notes,
            color: getEventColor(data.type || 'blocked')
          });
        }
      });
      
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching availability events:', error);
      toast.error('Erreur lors du chargement des disponibilités');
    } finally {
      setLoadingEvents(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'blocked': return '#ef4444';
      case 'maintenance': return '#f97316';
      case 'reserved': return '#3b82f6';
      case 'special_rate': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'blocked': return 'Bloqué';
      case 'maintenance': return 'Maintenance';
      case 'reserved': return 'Réservé';
      case 'special_rate': return 'Tarif spécial';
      default: return 'Autre';
    }
  };

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setFormData({
      title: '',
      start,
      end,
      type: 'blocked',
      notes: ''
    });
    setEditingEvent(null);
    setDialogOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: AvailabilityEvent) => {
    setFormData({
      title: event.title,
      start: event.start,
      end: event.end,
      type: event.type,
      price: event.price,
      notes: event.notes || ''
    });
    setEditingEvent(event);
    setDialogOpen(true);
  }, []);

  const handleSaveEvent = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Le titre est requis');
        return;
      }

      if (formData.start >= formData.end) {
        toast.error('La date de fin doit être après la date de début');
        return;
      }

      const eventData = {
        propertyId: selectedProperty,
        title: formData.title,
        startDate: formData.start,
        endDate: formData.end,
        type: formData.type,
        price: formData.price || null,
        notes: formData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingEvent) {
        // Update existing event
        const docRef = doc(db, 'availability', editingEvent.id);
        await setDoc(docRef, eventData, { merge: true });
        toast.success('Période mise à jour avec succès');
      } else {
        // Create new event
        const docRef = doc(db, 'availability', `${selectedProperty}-${Date.now()}`);
        await setDoc(docRef, eventData);
        toast.success('Période ajoutée avec succès');
      }

      setDialogOpen(false);
      await fetchAvailabilityEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    try {
      const docRef = doc(db, 'availability', editingEvent.id);
      await deleteDoc(docRef);
      
      toast.success('Période supprimée avec succès');
      setDialogOpen(false);
      await fetchAvailabilityEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const eventStyleGetter = (event: AvailabilityEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderColor: event.color,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px'
      }
    };
  };

  if (!mounted || loading) {
    return (
      <AdminLayout title="Gestion des Disponibilités">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout title="Gestion des Disponibilités">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Disponibilités</h1>
            <p className="text-muted-foreground">
              Gérez les périodes de disponibilité et de blocage de vos propriétés
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="default">Propriété par défaut</option>
              <option value="villa-1">Villa Méditerranéenne</option>
              <option value="apartment-1">Appartement Vue Mer</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Bloqué</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Réservé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Tarif spécial</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendrier des disponibilités
            </CardTitle>
            <CardDescription>
              Cliquez et glissez pour créer une nouvelle période de blocage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  view={currentView}
                  onView={setCurrentView}
                  date={currentDate}
                  onNavigate={setCurrentDate}
                  eventPropGetter={eventStyleGetter}
                  messages={{
                    next: 'Suivant',
                    previous: 'Précédent',
                    today: 'Aujourd\'hui',
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    agenda: 'Agenda',
                    date: 'Date',
                    time: 'Heure',
                    event: 'Événement',
                    noEventsInRange: 'Aucun événement dans cette période',
                    showMore: (total) => `+ ${total} de plus`
                  }}
                  formats={{
                    monthHeaderFormat: 'MMMM YYYY',
                    dayHeaderFormat: 'dddd DD/MM',
                    dayRangeHeaderFormat: ({ start, end }) =>
                      `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Périodes programmées</CardTitle>
            <CardDescription>
              Liste des périodes de blocage et événements à venir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune période programmée</p>
                <p className="text-sm">Cliquez sur le calendrier pour ajouter des périodes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: event.color }}
                        />
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {moment(event.start).format('DD/MM/YYYY')} - {moment(event.end).format('DD/MM/YYYY')}
                            </span>
                            <Badge variant="outline">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            {event.price && (
                              <span className="text-green-600 font-medium">
                                {event.price}€/nuit
                              </span>
                            )}
                          </div>
                          {event.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEvent(event);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Modifier la période' : 'Nouvelle période'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Maintenance, Période bloquée..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Date de début *</Label>
                <Input
                  id="start"
                  type="date"
                  value={moment(formData.start).format('YYYY-MM-DD')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    start: new Date(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="end">Date de fin *</Label>
                <Input
                  id="end"
                  type="date"
                  value={moment(formData.end).format('YYYY-MM-DD')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    end: new Date(e.target.value) 
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  type: e.target.value as 'blocked' | 'maintenance' | 'special_rate'
                })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="blocked">Bloqué</option>
                <option value="maintenance">Maintenance</option>
                <option value="special_rate">Tarif spécial</option>
              </select>
            </div>

            {formData.type === 'special_rate' && (
              <div>
                <Label htmlFor="price">Prix par nuit (€)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    price: parseFloat(e.target.value) || undefined 
                  })}
                  placeholder="450"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>

            <div className="flex justify-between gap-3">
              {editingEvent && (
                <Button variant="destructive" onClick={handleDeleteEvent}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveEvent}>
                  <Check className="h-4 w-4 mr-2" />
                  {editingEvent ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}