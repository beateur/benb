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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  FileText, 
  Edit, 
  Eye, 
  Undo,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { toast } from 'sonner';

interface PropertyTexts {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  amenities: string[];
  rules: string[];
  checkInInstructions: string;
  checkOutInstructions: string;
  localInfo: string;
  emergencyInfo: string;
  wifiInfo: string;
  parkingInfo: string;
  updatedAt: Date;
}

interface TextSection {
  key: keyof PropertyTexts;
  label: string;
  type: 'input' | 'textarea' | 'array';
  placeholder: string;
  description?: string;
  maxLength?: number;
}

export default function TextsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('default');
  const [propertyTexts, setPropertyTexts] = useState<PropertyTexts | null>(null);
  const [originalTexts, setOriginalTexts] = useState<PropertyTexts | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingTexts, setLoadingTexts] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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
      fetchPropertyTexts();
    }
  }, [mounted, user, isAdmin, selectedProperty]);

  useEffect(() => {
    if (propertyTexts && originalTexts) {
      const changed = JSON.stringify(propertyTexts) !== JSON.stringify(originalTexts);
      setHasChanges(changed);
    }
  }, [propertyTexts, originalTexts]);

  const textSections: TextSection[] = [
    {
      key: 'name',
      label: 'Nom de la propriété',
      type: 'input',
      placeholder: 'Villa Méditerranéenne d\'Exception',
      maxLength: 100
    },
    {
      key: 'shortDescription',
      label: 'Description courte',
      type: 'textarea',
      placeholder: 'Luxe, confort et vue panoramique sur la Côte d\'Azur',
      description: 'Description courte pour les aperçus (max 200 caractères)',
      maxLength: 200
    },
    {
      key: 'description',
      label: 'Description complète',
      type: 'textarea',
      placeholder: 'Description détaillée de la propriété...',
      description: 'Description complète visible sur la page de détail'
    }
  ];

  const infoSections: TextSection[] = [
    {
      key: 'checkInInstructions',
      label: 'Instructions d\'arrivée',
      type: 'textarea',
      placeholder: 'Instructions pour l\'arrivée des invités...'
    },
    {
      key: 'checkOutInstructions',
      label: 'Instructions de départ',
      type: 'textarea',
      placeholder: 'Instructions pour le départ des invités...'
    },
    {
      key: 'localInfo',
      label: 'Informations locales',
      type: 'textarea',
      placeholder: 'Informations sur les environs, restaurants, activités...'
    },
    {
      key: 'emergencyInfo',
      label: 'Informations d\'urgence',
      type: 'textarea',
      placeholder: 'Numéros d\'urgence, contacts importants...'
    },
    {
      key: 'wifiInfo',
      label: 'Informations WiFi',
      type: 'textarea',
      placeholder: 'Nom du réseau, mot de passe...'
    },
    {
      key: 'parkingInfo',
      label: 'Informations parking',
      type: 'textarea',
      placeholder: 'Instructions pour le stationnement...'
    }
  ];

  const fetchPropertyTexts = async () => {
    try {
      setLoadingTexts(true);
      const docRef = doc(db, 'properties', selectedProperty);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as PropertyTexts;
        
        setPropertyTexts(data);
        setOriginalTexts(JSON.parse(JSON.stringify(data)));
      } else {
        // Create default structure
        const defaultTexts: PropertyTexts = {
          id: selectedProperty,
          name: 'Villa Méditerranéenne d\'Exception',
          description: 'Découvrez cette propriété d\'exception située dans un cadre idyllique...',
          shortDescription: 'Luxe, confort et vue panoramique sur la Côte d\'Azur',
          amenities: ['Piscine privée', 'WiFi gratuit', 'Parking', 'Climatisation', 'Vue mer', 'Cuisine équipée'],
          rules: ['Non fumeur', 'Animaux non autorisés', 'Pas de fêtes'],
          checkInInstructions: 'Arrivée à partir de 16h00. Les clés sont disponibles...',
          checkOutInstructions: 'Départ avant 11h00. Merci de laisser les clés...',
          localInfo: 'Restaurants recommandés, activités locales...',
          emergencyInfo: 'En cas d\'urgence, contactez le +33 123 456 789',
          wifiInfo: 'Réseau: VillaMediterranee - Mot de passe: welcome2024',
          parkingInfo: 'Parking privé disponible dans la propriété',
          updatedAt: new Date()
        };
        
        setPropertyTexts(defaultTexts);
        setOriginalTexts(JSON.parse(JSON.stringify(defaultTexts)));
      }
    } catch (error) {
      console.error('Error fetching property texts:', error);
      toast.error('Erreur lors du chargement des textes');
    } finally {
      setLoadingTexts(false);
    }
  };

  const handleSave = async () => {
    if (!propertyTexts) return;

    try {
      setSaving(true);
      const docRef = doc(db, 'properties', selectedProperty);
      
      await setDoc(docRef, {
        ...propertyTexts,
        updatedAt: new Date()
      }, { merge: true });
      
      setOriginalTexts(JSON.parse(JSON.stringify(propertyTexts)));
      setHasChanges(false);
      toast.success('Textes sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving texts:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalTexts) {
      setPropertyTexts(JSON.parse(JSON.stringify(originalTexts)));
      setHasChanges(false);
    }
  };

  const updateField = (key: keyof PropertyTexts, value: any) => {
    if (!propertyTexts) return;
    
    setPropertyTexts({
      ...propertyTexts,
      [key]: value
    });
  };

  const addArrayItem = (key: 'amenities' | 'rules') => {
    if (!propertyTexts) return;
    
    const newItem = prompt(`Ajouter un nouvel élément à ${key === 'amenities' ? 'équipements' : 'règles'}:`);
    if (newItem && newItem.trim()) {
      updateField(key, [...propertyTexts[key], newItem.trim()]);
    }
  };

  const removeArrayItem = (key: 'amenities' | 'rules', index: number) => {
    if (!propertyTexts) return;
    
    const newArray = propertyTexts[key].filter((_, i) => i !== index);
    updateField(key, newArray);
  };

  const updateArrayItem = (key: 'amenities' | 'rules', index: number, value: string) => {
    if (!propertyTexts) return;
    
    const newArray = [...propertyTexts[key]];
    newArray[index] = value;
    updateField(key, newArray);
  };

  if (!mounted || loading) {
    return (
      <AdminLayout title="Gestion des Textes">
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
    <AdminLayout title="Gestion des Textes">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Textes & Contenu</h1>
            <p className="text-muted-foreground">
              Gérez les textes descriptifs de vos propriétés
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
            
            {hasChanges && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset} disabled={saving}>
                  <Undo className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Changes Alert */}
        {hasChanges && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder vos changements.
            </AlertDescription>
          </Alert>
        )}

        {loadingTexts ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : propertyTexts ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informations de base</TabsTrigger>
              <TabsTrigger value="amenities">Équipements & Règles</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="info">Informations pratiques</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informations de base
                  </CardTitle>
                  <CardDescription>
                    Nom et descriptions principales de la propriété
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {textSections.map((section) => (
                    <div key={section.key} className="space-y-2">
                      <Label htmlFor={section.key}>
                        {section.label}
                        {section.maxLength && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({(propertyTexts[section.key] as string)?.length || 0}/{section.maxLength})
                          </span>
                        )}
                      </Label>
                      {section.description && (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      )}
                      {section.type === 'input' ? (
                        <Input
                          id={section.key}
                          value={propertyTexts[section.key] as string || ''}
                          onChange={(e) => updateField(section.key, e.target.value)}
                          placeholder={section.placeholder}
                          maxLength={section.maxLength}
                        />
                      ) : (
                        <Textarea
                          id={section.key}
                          value={propertyTexts[section.key] as string || ''}
                          onChange={(e) => updateField(section.key, e.target.value)}
                          placeholder={section.placeholder}
                          rows={section.key === 'description' ? 6 : 3}
                          maxLength={section.maxLength}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Équipements</span>
                      <Button size="sm" onClick={() => addArrayItem('amenities')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Liste des équipements disponibles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {propertyTexts.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={amenity}
                          onChange={(e) => updateArrayItem('amenities', index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeArrayItem('amenities', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Règles</span>
                      <Button size="sm" onClick={() => addArrayItem('rules')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Règles et restrictions de la propriété
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {propertyTexts.rules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={rule}
                          onChange={(e) => updateArrayItem('rules', index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeArrayItem('rules', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions d'arrivée</CardTitle>
                    <CardDescription>
                      Instructions pour l'arrivée des invités
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={propertyTexts.checkInInstructions}
                      onChange={(e) => updateField('checkInInstructions', e.target.value)}
                      placeholder="Instructions pour l'arrivée des invités..."
                      rows={6}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Instructions de départ</CardTitle>
                    <CardDescription>
                      Instructions pour le départ des invités
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={propertyTexts.checkOutInstructions}
                      onChange={(e) => updateField('checkOutInstructions', e.target.value)}
                      placeholder="Instructions pour le départ des invités..."
                      rows={6}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {infoSections.map((section) => (
                  <Card key={section.key}>
                    <CardHeader>
                      <CardTitle>{section.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={propertyTexts[section.key] as string || ''}
                        onChange={(e) => updateField(section.key, e.target.value)}
                        placeholder={section.placeholder}
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune donnée trouvée</h3>
              <p className="text-muted-foreground">
                Impossible de charger les textes de cette propriété.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}