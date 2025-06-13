'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  MapPin,
  Star,
  ExternalLink,
  Music,
  Utensils,
  Palette,
  Waves,
  Mountain,
  Camera,
  Loader2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'festival' | 'concert' | 'exhibition' | 'sports' | 'gastronomy' | 'culture' | 'nature';
  startDate: string;
  endDate: string;
  location: string;
  distance?: string;
  price?: string;
  website?: string;
  featured: boolean;
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventForm {
  title: string;
  description: string;
  type: 'festival' | 'concert' | 'exhibition' | 'sports' | 'gastronomy' | 'culture' | 'nature';
  startDate: string;
  endDate: string;
  location: string;
  distance: string;
  price: string;
  website: string;
  featured: boolean;
  propertyId: string;
}

export default function EventsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventForm>({
    title: '',
    description: '',
    type: 'culture',
    startDate: '',
    endDate: '',
    location: '',
    distance: '',
    price: '',
    website: '',
    featured: false,
    propertyId: 'default'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (mounted && user && isAdmin) {
      fetchEvents();
    }
  }, [mounted, user, isAdmin]);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedType]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('startDate', 'asc'));
      const snapshot = await getDocs(q);
      
      const fetchedEvents: Event[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Event[];
      
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (!formData.title.trim() || !formData.startDate || !formData.endDate) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      setSaving(true);

      const eventData = {
        ...formData,
        createdAt: editingEvent?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingEvent) {
        // Update existing event
        const docRef = doc(db, 'events', editingEvent.id);
        await updateDoc(docRef, eventData);
        toast.success('Événement mis à jour avec succès');
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), eventData);
        toast.success('Événement créé avec succès');
      }

      setDialogOpen(false);
      resetForm();
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const docRef = doc(db, 'events', eventId);
      await deleteDoc(docRef);
      
      toast.success('Événement supprimé avec succès');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      distance: event.distance || '',
      price: event.price || '',
      website: event.website || '',
      featured: event.featured,
      propertyId: event.propertyId || 'default'
    });
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'culture',
      startDate: '',
      endDate: '',
      location: '',
      distance: '',
      price: '',
      website: '',
      featured: false,
      propertyId: 'default'
    });
    setEditingEvent(null);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'festival': return <Music className="h-5 w-5" />;
      case 'concert': return <Music className="h-5 w-5" />;
      case 'exhibition': return <Palette className="h-5 w-5" />;
      case 'sports': return <Waves className="h-5 w-5" />;
      case 'gastronomy': return <Utensils className="h-5 w-5" />;
      case 'culture': return <Camera className="h-5 w-5" />;
      case 'nature': return <Mountain className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'festival': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'concert': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'exhibition': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sports': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'gastronomy': return 'bg-red-100 text-red-800 border-red-200';
      case 'culture': return 'bg-green-100 text-green-800 border-green-200';
      case 'nature': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const eventTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'festival', label: 'Festivals' },
    { value: 'concert', label: 'Concerts' },
    { value: 'exhibition', label: 'Expositions' },
    { value: 'sports', label: 'Sports' },
    { value: 'gastronomy', label: 'Gastronomie' },
    { value: 'culture', label: 'Culture' },
    { value: 'nature', label: 'Nature' }
  ];

  if (!mounted || loading) {
    return (
      <AdminLayout title="Gestion des Événements">
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
    <AdminLayout title="Gestion des Événements">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Événements</h1>
            <p className="text-muted-foreground">
              Gérez les événements locaux et activités à proximité de vos propriétés
            </p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un événement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {loadingEvents ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {events.length === 0 ? 'Aucun événement' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {events.length === 0 
                  ? 'Commencez par ajouter votre premier événement.'
                  : 'Aucun événement ne correspond à vos critères de recherche.'
                }
              </p>
              {events.length === 0 && (
                <Button onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un événement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-shadow">
                {event.featured && (
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Star className="h-4 w-4" />
                      Événement phare
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`${getEventColor(event.type)} flex items-center gap-1`}
                    >
                      {getEventIcon(event.type)}
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                    {event.distance && (
                      <Badge variant="secondary" className="text-xs">
                        {event.distance}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>
                        {format(parseISO(event.startDate), 'dd MMM', { locale: fr })}
                        {event.startDate !== event.endDate && (
                          <> - {format(parseISO(event.endDate), 'dd MMM yyyy', { locale: fr })}</>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    {event.price && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-green-600">{event.price}</span>
                      </div>
                    )}

                    {event.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                        <a 
                          href={event.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Festival de Jazz de Juan-les-Pins"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée de l'événement..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="type">Type d'événement</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as EventForm['type']
                  })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="festival">Festival</option>
                  <option value="concert">Concert</option>
                  <option value="exhibition">Exposition</option>
                  <option value="sports">Sports</option>
                  <option value="gastronomy">Gastronomie</option>
                  <option value="culture">Culture</option>
                  <option value="nature">Nature</option>
                </select>
              </div>

              <div>
                <Label htmlFor="propertyId">Propriété</Label>
                <select
                  id="propertyId"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="default">Propriété par défaut</option>
                  <option value="villa-1">Villa Méditerranéenne</option>
                  <option value="apartment-1">Appartement Vue Mer</option>
                </select>
              </div>

              <div>
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Juan-les-Pins"
                />
              </div>

              <div>
                <Label htmlFor="distance">Distance</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="25 km"
                />
              </div>

              <div>
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="À partir de 45€"
                />
              </div>

              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <Label htmlFor="featured">Événement phare</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEvent} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {editingEvent ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}