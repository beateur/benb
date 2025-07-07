'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Euro, 
  TrendingUp, 
  Calendar,
  Percent,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Undo
} from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PricingData {
  id: string;
  basePrice: number;
  currency: string;
  cleaningFee: number;
  serviceFeePercentage: number;
  taxPercentage: number;
  securityDeposit: number;
  minimumStay: number;
  maximumStay: number;
  seasonalRates: SeasonalRate[];
  weeklyDiscount: number;
  monthlyDiscount: number;
  lastMinuteDiscount: number;
  earlyBirdDiscount: number;
  updatedAt: Date;
}

interface SeasonalRate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  minimumStay: number;
  color: string;
}

export default function PricesPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('default');
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [originalData, setOriginalData] = useState<PricingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(true);
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
      fetchPricingData();
    }
  }, [mounted, user, isAdmin, selectedProperty]);

  useEffect(() => {
    if (pricingData && originalData) {
      const changed = JSON.stringify(pricingData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [pricingData, originalData]);

  const fetchPricingData = async () => {
    try {
      setLoadingPrices(true);
      const docRef = doc(db, 'properties', selectedProperty);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const pricing: PricingData = {
          id: docSnap.id,
          basePrice: data.pricePerNight || 450,
          currency: data.currency || 'EUR',
          cleaningFee: data.cleaningFee || 200,
          serviceFeePercentage: data.serviceFeePercentage || 0,
          taxPercentage: data.taxPercentage || 5.5,
          securityDeposit: data.securityDeposit || 500,
          minimumStay: data.minimumStay || 3,
          maximumStay: data.maximumStay || 30,
          seasonalRates: data.seasonalRates || [],
          weeklyDiscount: data.weeklyDiscount || 10,
          monthlyDiscount: data.monthlyDiscount || 20,
          lastMinuteDiscount: data.lastMinuteDiscount || 15,
          earlyBirdDiscount: data.earlyBirdDiscount || 10,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        
        setPricingData(pricing);
        setOriginalData(JSON.parse(JSON.stringify(pricing)));
      } else {
        // Create default pricing structure
        const defaultPricing: PricingData = {
          id: selectedProperty,
          basePrice: 450,
          currency: 'EUR',
          cleaningFee: 200,
          serviceFeePercentage: 0,
          taxPercentage: 5.5,
          securityDeposit: 500,
          minimumStay: 3,
          maximumStay: 30,
          seasonalRates: [
            {
              id: '1',
              name: 'Haute saison',
              startDate: '2024-07-01',
              endDate: '2024-08-31',
              pricePerNight: 650,
              minimumStay: 7,
              color: '#ef4444'
            },
            {
              id: '2',
              name: 'Moyenne saison',
              startDate: '2024-05-01',
              endDate: '2024-06-30',
              pricePerNight: 550,
              minimumStay: 5,
              color: '#f97316'
            }
          ],
          weeklyDiscount: 10,
          monthlyDiscount: 20,
          lastMinuteDiscount: 15,
          earlyBirdDiscount: 10,
          updatedAt: new Date()
        };
        
        setPricingData(defaultPricing);
        setOriginalData(JSON.parse(JSON.stringify(defaultPricing)));
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast.error('Erreur lors du chargement des tarifs');
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleSave = async () => {
    if (!pricingData) return;

    try {
      setSaving(true);
      const docRef = doc(db, 'properties', selectedProperty);
      
      await setDoc(docRef, {
        pricePerNight: pricingData.basePrice,
        currency: pricingData.currency,
        cleaningFee: pricingData.cleaningFee,
        serviceFeePercentage: pricingData.serviceFeePercentage,
        taxPercentage: pricingData.taxPercentage,
        securityDeposit: pricingData.securityDeposit,
        minimumStay: pricingData.minimumStay,
        maximumStay: pricingData.maximumStay,
        seasonalRates: pricingData.seasonalRates,
        weeklyDiscount: pricingData.weeklyDiscount,
        monthlyDiscount: pricingData.monthlyDiscount,
        lastMinuteDiscount: pricingData.lastMinuteDiscount,
        earlyBirdDiscount: pricingData.earlyBirdDiscount,
        updatedAt: new Date()
      }, { merge: true });
      
      setOriginalData(JSON.parse(JSON.stringify(pricingData)));
      setHasChanges(false);
      toast.success('Tarifs sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setPricingData(JSON.parse(JSON.stringify(originalData)));
      setHasChanges(false);
    }
  };

  const updateField = (key: keyof PricingData, value: any) => {
    if (!pricingData) return;
    
    setPricingData({
      ...pricingData,
      [key]: value
    });
  };

  const addSeasonalRate = () => {
    if (!pricingData) return;
    
    const newRate: SeasonalRate = {
      id: Date.now().toString(),
      name: 'Nouvelle saison',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      pricePerNight: pricingData.basePrice,
      minimumStay: pricingData.minimumStay,
      color: '#3b82f6'
    };
    
    updateField('seasonalRates', [...pricingData.seasonalRates, newRate]);
  };

  const updateSeasonalRate = (index: number, updates: Partial<SeasonalRate>) => {
    if (!pricingData) return;
    
    const newRates = [...pricingData.seasonalRates];
    newRates[index] = { ...newRates[index], ...updates };
    updateField('seasonalRates', newRates);
  };

  const removeSeasonalRate = (index: number) => {
    if (!pricingData) return;
    
    const newRates = pricingData.seasonalRates.filter((_, i) => i !== index);
    updateField('seasonalRates', newRates);
  };

  const duplicateSeasonalRate = (index: number) => {
    if (!pricingData) return;
    
    const rateToDuplicate = pricingData.seasonalRates[index];
    const newRate: SeasonalRate = {
      ...rateToDuplicate,
      id: Date.now().toString(),
      name: `${rateToDuplicate.name} (copie)`
    };
    
    updateField('seasonalRates', [...pricingData.seasonalRates, newRate]);
  };

  const calculateTotalPrice = (nights: number, basePrice: number) => {
    if (!pricingData) return 0;
    
    const subtotal = nights * basePrice;
    const serviceFee = 0; // Suppression des frais de service
    const touristTax = nights * 2 * 2; // 2€ par personne par nuit (2 personnes par défaut)
    
    return subtotal + pricingData.cleaningFee + touristTax;
  };

  if (!mounted || loading) {
    return (
      <AdminLayout title="Gestion des Tarifs">
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
    <AdminLayout title="Gestion des Tarifs">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tarifs & Pricing</h1>
            <p className="text-muted-foreground">
              Gérez les tarifs et politiques de prix de vos propriétés
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

        {loadingPrices ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : pricingData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Tarifs de base</TabsTrigger>
              <TabsTrigger value="seasonal">Tarifs saisonniers</TabsTrigger>
              <TabsTrigger value="discounts">Remises</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Base Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Tarification de base
                    </CardTitle>
                    <CardDescription>
                      Prix de base et frais principaux
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="basePrice">Prix par nuit</Label>
                        <div className="relative">
                          <Input
                            id="basePrice"
                            type="number"
                            value={pricingData.basePrice}
                            onChange={(e) => updateField('basePrice', parseFloat(e.target.value) || 0)}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            €
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cleaningFee">Frais de ménage</Label>
                        <div className="relative">
                          <Input
                            id="cleaningFee"
                            type="number"
                            value={pricingData.cleaningFee}
                            onChange={(e) => updateField('cleaningFee', parseFloat(e.target.value) || 0)}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            €
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Champ frais de service masqué
                      <div>
                        <Label htmlFor="serviceFee">Frais de service (%)</Label>
                        <div className="relative">
                          <Input
                            id="serviceFee"
                            type="number"
                            value={pricingData.serviceFeePercentage}
                            onChange={(e) => updateField('serviceFeePercentage', parseFloat(e.target.value) || 0)}
                            className="pr-12"
                            step="0.1"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                      */}
                      <div>
                        <Label htmlFor="taxPercentage">Taxe de séjour (€/pers./nuit)</Label>
                        <div className="relative">
                          <Input
                            id="taxPercentage"
                            type="number"
                            value={2}
                            readOnly
                            className="pr-12 bg-muted"
                            step="0.1"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            €
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Taxe fixe réglementaire de Saint-Florent
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="securityDeposit">Caution</Label>
                      <div className="relative">
                        <Input
                          id="securityDeposit"
                          type="number"
                          value={pricingData.securityDeposit}
                          onChange={(e) => updateField('securityDeposit', parseFloat(e.target.value) || 0)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stay Policies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Politiques de séjour
                    </CardTitle>
                    <CardDescription>
                      Durées minimum et maximum de séjour
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="minimumStay">Séjour minimum (nuits)</Label>
                      <Input
                        id="minimumStay"
                        type="number"
                        value={pricingData.minimumStay}
                        onChange={(e) => updateField('minimumStay', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maximumStay">Séjour maximum (nuits)</Label>
                      <Input
                        id="maximumStay"
                        type="number"
                        value={pricingData.maximumStay}
                        onChange={(e) => updateField('maximumStay', parseInt(e.target.value) || 30)}
                        min="1"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Exemple de calcul</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>3 nuits TTC × {pricingData.basePrice}€</span>
                          <span>{3 * pricingData.basePrice}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de ménage</span>
                          <span>{pricingData.cleaningFee}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxe de séjour (2 pers. × 3 nuits)</span>
                          <span>{3 * 2 * 2}€</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>{calculateTotalPrice(3, pricingData.basePrice)}€</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Tarifs saisonniers
                    </span>
                    <Button onClick={addSeasonalRate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une saison
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Définissez des tarifs spéciaux pour différentes périodes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {pricingData.seasonalRates.map((rate, index) => (
                    <Card key={rate.id} className="border-l-4" style={{ borderLeftColor: rate.color }}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`name-${index}`}>Nom de la saison</Label>
                            <Input
                              id={`name-${index}`}
                              value={rate.name}
                              onChange={(e) => updateSeasonalRate(index, { name: e.target.value })}
                              placeholder="Ex: Haute saison"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`startDate-${index}`}>Date de début</Label>
                            <Input
                              id={`startDate-${index}`}
                              type="date"
                              value={rate.startDate}
                              onChange={(e) => updateSeasonalRate(index, { startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`endDate-${index}`}>Date de fin</Label>
                            <Input
                              id={`endDate-${index}`}
                              type="date"
                              value={rate.endDate}
                              onChange={(e) => updateSeasonalRate(index, { endDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`price-${index}`}>Prix par nuit</Label>
                            <div className="relative">
                              <Input
                                id={`price-${index}`}
                                type="number"
                                value={rate.pricePerNight}
                                onChange={(e) => updateSeasonalRate(index, { pricePerNight: parseFloat(e.target.value) || 0 })}
                                className="pr-12"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                €
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`minStay-${index}`}>Séjour minimum</Label>
                            <Input
                              id={`minStay-${index}`}
                              type="number"
                              value={rate.minimumStay}
                              onChange={(e) => updateSeasonalRate(index, { minimumStay: parseInt(e.target.value) || 1 })}
                              min="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`color-${index}`}>Couleur</Label>
                            <Input
                              id={`color-${index}`}
                              type="color"
                              value={rate.color}
                              onChange={(e) => updateSeasonalRate(index, { color: e.target.value })}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => duplicateSeasonalRate(index)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSeasonalRate(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span>Différence avec le tarif de base:</span>
                            <Badge variant={rate.pricePerNight > pricingData.basePrice ? 'destructive' : 'default'}>
                              {rate.pricePerNight > pricingData.basePrice ? '+' : ''}
                              {rate.pricePerNight - pricingData.basePrice}€
                              ({((rate.pricePerNight - pricingData.basePrice) / pricingData.basePrice * 100).toFixed(1)}%)
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pricingData.seasonalRates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun tarif saisonnier défini</p>
                      <p className="text-sm">Cliquez sur "Ajouter une saison" pour commencer</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discounts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Remises sur la durée
                    </CardTitle>
                    <CardDescription>
                      Remises automatiques selon la durée du séjour
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="weeklyDiscount">Remise hebdomadaire (%)</Label>
                      <div className="relative">
                        <Input
                          id="weeklyDiscount"
                          type="number"
                          value={pricingData.weeklyDiscount}
                          onChange={(e) => updateField('weeklyDiscount', parseFloat(e.target.value) || 0)}
                          className="pr-12"
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Appliquée pour les séjours de 7 nuits ou plus
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="monthlyDiscount">Remise mensuelle (%)</Label>
                      <div className="relative">
                        <Input
                          id="monthlyDiscount"
                          type="number"
                          value={pricingData.monthlyDiscount}
                          onChange={(e) => updateField('monthlyDiscount', parseFloat(e.target.value) || 0)}
                          className="pr-12"
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Appliquée pour les séjours de 28 nuits ou plus
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Remises promotionnelles</CardTitle>
                    <CardDescription>
                      Remises basées sur le timing de la réservation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="lastMinuteDiscount">Remise dernière minute (%)</Label>
                      <div className="relative">
                        <Input
                          id="lastMinuteDiscount"
                          type="number"
                          value={pricingData.lastMinuteDiscount}
                          onChange={(e) => updateField('lastMinuteDiscount', parseFloat(e.target.value) || 0)}
                          className="pr-12"
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Appliquée pour les réservations à moins de 7 jours
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="earlyBirdDiscount">Remise réservation anticipée (%)</Label>
                      <div className="relative">
                        <Input
                          id="earlyBirdDiscount"
                          type="number"
                          value={pricingData.earlyBirdDiscount}
                          onChange={(e) => updateField('earlyBirdDiscount', parseFloat(e.target.value) || 0)}
                          className="pr-12"
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Appliquée pour les réservations à plus de 60 jours
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu des tarifs</CardTitle>
                  <CardDescription>
                    Simulation de prix pour différents scénarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Weekend */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Weekend (2 nuits)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>2 nuits TTC × {pricingData.basePrice}€</span>
                          <span>{2 * pricingData.basePrice}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de ménage</span>
                          <span>{pricingData.cleaningFee}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxe de séjour (2 pers. × 2 nuits)</span>
                          <span>{2 * 2 * 2}€</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>{calculateTotalPrice(2, pricingData.basePrice)}€</span>
                        </div>
                      </div>
                    </div>

                    {/* Week */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Semaine (7 nuits)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>7 × {pricingData.basePrice}€</span>
                          <span>{7 * pricingData.basePrice}€</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Remise hebdomadaire (-{pricingData.weeklyDiscount}%)</span>
                          <span>-{Math.round(7 * pricingData.basePrice * (pricingData.weeklyDiscount / 100))}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de ménage</span>
                          <span>{pricingData.cleaningFee}€</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>{calculateTotalPrice(7, pricingData.basePrice * (1 - pricingData.weeklyDiscount / 100))}€</span>
                        </div>
                      </div>
                    </div>

                    {/* Month */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Mois (30 nuits)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>30 × {pricingData.basePrice}€</span>
                          <span>{30 * pricingData.basePrice}€</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Remise mensuelle (-{pricingData.monthlyDiscount}%)</span>
                          <span>-{Math.round(30 * pricingData.basePrice * (pricingData.monthlyDiscount / 100))}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de ménage</span>
                          <span>{pricingData.cleaningFee}€</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>{calculateTotalPrice(30, pricingData.basePrice * (1 - pricingData.monthlyDiscount / 100))}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Euro className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune donnée trouvée</h3>
              <p className="text-muted-foreground">
                Impossible de charger les tarifs de cette propriété.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}