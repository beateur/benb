'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Eye, 
  Download,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Loader2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { storage, db } from '@/src/firebase';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  propertyId: string;
  url: string;
  filename: string;
  alt: string;
  order: number;
  isMain: boolean;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export default function MediaPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    console.log("ça boucle 20")
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("ça boucle 21")
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    console.log("ça boucle 22")
    if (mounted && user && isAdmin) {
      fetchMediaItems();
    }
  }, [mounted, user, isAdmin, selectedProperty]);

  const fetchMediaItems = async () => {
    try {
      setLoadingMedia(true);
      const mediaRef = collection(db, 'properties', selectedProperty, 'media');
      const q = query(mediaRef, orderBy('order', 'asc'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const items: MediaItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as MediaItem[];
      
      setMediaItems(items);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoadingMedia(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      filename: file.name,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setUploadProgress(prev => [...prev, ...newUploads]);

    for (const file of acceptedFiles) {
      try {
        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const storageRef = ref(storage, `properties/${selectedProperty}/media/${filename}`);
        
        // Upload file
        const uploadTask = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        
        // Save metadata to Firestore
        const mediaRef = collection(db, 'properties', selectedProperty, 'media');
        await addDoc(mediaRef, {
          propertyId: selectedProperty,
          url: downloadURL,
          filename: file.name,
          alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
          order: mediaItems.length,
          isMain: mediaItems.length === 0, // First image is main by default
          size: file.size,
          type: file.type,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Update progress
        setUploadProgress(prev => 
          prev.map(item => 
            item.filename === file.name 
              ? { ...item, progress: 100, status: 'completed' }
              : item
          )
        );

        toast.success(`${file.name} uploadé avec succès`);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress(prev => 
          prev.map(item => 
            item.filename === file.name 
              ? { ...item, status: 'error' }
              : item
          )
        );
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }

    // Refresh media items
    await fetchMediaItems();
    
    // Clear upload progress after 3 seconds
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  }, [selectedProperty, mediaItems.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleDeleteMedia = async (item: MediaItem) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, item.url);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      const docRef = doc(db, 'properties', selectedProperty, 'media', item.id);
      await deleteDoc(docRef);
      
      toast.success('Image supprimée avec succès');
      await fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditMedia = (item: MediaItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleUpdateMedia = async (updates: Partial<MediaItem>) => {
    if (!editingItem) return;

    try {
      const docRef = doc(db, 'properties', selectedProperty, 'media', editingItem.id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      toast.success('Média mis à jour avec succès');
      setEditDialogOpen(false);
      setEditingItem(null);
      await fetchMediaItems();
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSetMainImage = async (item: MediaItem) => {
    try {
      // Remove main status from all images
      const batch = mediaItems.map(async (media) => {
        const docRef = doc(db, 'properties', selectedProperty, 'media', media.id);
        await updateDoc(docRef, { isMain: false });
      });
      
      await Promise.all(batch);
      
      // Set new main image
      const docRef = doc(db, 'properties', selectedProperty, 'media', item.id);
      await updateDoc(docRef, { isMain: true });
      
      toast.success('Image principale mise à jour');
      await fetchMediaItems();
    } catch (error) {
      console.error('Error setting main image:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredItems = mediaItems.filter(item =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted || loading) {
    return (
      <AdminLayout title="Gestion des Médias">
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
    <AdminLayout title="Gestion des Médias">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Médias</h1>
            <p className="text-muted-foreground">
              Gérez les photos et médias de vos propriétés
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
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de médias
            </CardTitle>
            <CardDescription>
              Glissez-déposez vos images ou cliquez pour sélectionner (max 10MB par fichier)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary font-medium">Déposez les fichiers ici...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Glissez-déposez vos images ici
                  </p>
                  <p className="text-muted-foreground">
                    ou cliquez pour sélectionner des fichiers
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Upload en cours...</h4>
                {uploadProgress.map((upload, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{upload.filename}</span>
                      <div className="flex items-center gap-2">
                        {upload.status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
                        {upload.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {upload.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    </div>
                    <Progress value={upload.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom de fichier ou description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid/List */}
        {loadingMedia ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun média</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par uploader vos premières images.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  <div>
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.isMain && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" onClick={() => handleEditMedia(item)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => window.open(item.url, '_blank')}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMedia(item)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate mb-1">{item.filename}</h3>
                      <p className="text-sm text-muted-foreground truncate mb-2">{item.alt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                        <span>Ordre: {item.order}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {!item.isMain && (
                          <Button size="sm" variant="outline" onClick={() => handleSetMainImage(item)}>
                            <Star className="h-3 w-3 mr-1" />
                            Définir principal
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{item.filename}</h3>
                          {item.isMain && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">{item.alt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                          <span>Ordre: {item.order}</span>
                          <span>{item.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditMedia(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(item.url, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteMedia(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le média</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={editingItem.url}
                  alt={editingItem.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alt">Description (Alt text)</Label>
                  <Input
                    id="alt"
                    value={editingItem.alt}
                    onChange={(e) => setEditingItem({ ...editingItem, alt: e.target.value })}
                    placeholder="Description de l'image"
                  />
                </div>
                <div>
                  <Label htmlFor="order">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    type="number"
                    value={editingItem.order}
                    onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingItem.isMain}
                    onChange={(e) => setEditingItem({ ...editingItem, isMain: e.target.checked })}
                  />
                  Image principale
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => handleUpdateMedia({
                  alt: editingItem.alt,
                  order: editingItem.order,
                  isMain: editingItem.isMain
                })}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}