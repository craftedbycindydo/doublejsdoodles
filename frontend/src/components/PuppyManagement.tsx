import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageGallery, ImageCarousel } from './ui/image-gallery';
import { Edit3, Trash2, Plus, Camera, Upload, Eye, Save, X } from 'lucide-react';
import { api, type Puppy } from '../lib/api';

interface PuppyManagementProps {
  puppy: Puppy;
  litterId: string;
  onUpdate: () => void;
  onDelete?: () => void;
}

export function PuppyManagement({ puppy, litterId, onUpdate, onDelete }: PuppyManagementProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [editData, setEditData] = useState({
    name: puppy.name,
    gender: puppy.gender,
    color: puppy.color,
    birth_date: puppy.birth_date,
    estimated_adult_weight: puppy.estimated_adult_weight?.toString() || '',
    status: puppy.status,
    microchip_id: puppy.microchip_id || '',
    notes: puppy.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'reserved':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'sold':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleUpdatePuppy = async () => {
    if (!puppy.id) return;
    
    // Validate required fields
    if (!editData.name.trim() || !editData.color.trim() || !editData.birth_date.trim()) {
      alert("Please fill in all required fields: Name, Color, and Birth Date");
      return;
    }
    
    // Validate birth date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(editData.birth_date)) {
      alert("Birth Date must be in YYYY-MM-DD format");
      return;
    }
    
    setLoading(true);
    try {
      await api.updatePuppy(litterId, puppy.id, {
        name: editData.name.trim(),
        gender: editData.gender,
        color: editData.color.trim(),
        birth_date: editData.birth_date.trim(), // Required field
        estimated_adult_weight: editData.estimated_adult_weight ? parseFloat(editData.estimated_adult_weight) : undefined,
        status: editData.status as any,
        microchip_id: editData.microchip_id?.trim() || undefined,
        notes: editData.notes?.trim() || undefined
      });
      
      onUpdate();
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update puppy:', error);
      alert('Failed to update puppy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeletePuppy = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeletePuppy = async () => {
    if (!puppy.id) return;
    
    try {
      await api.deletePuppy(litterId, puppy.id);
      onUpdate();
      if (onDelete) onDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete puppy:', error);
      alert('Failed to delete puppy. Please try again.');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!puppy.id) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/puppies/${puppy.id}/images`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        onUpdate();
        setShowImageUpload(false);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  return (
    <Card className="breeder-card group hover:shadow-lg transition-all duration-300">
      <div className="relative">
        {puppy.images && puppy.images.length > 0 ? (
          <ImageCarousel 
            images={puppy.images}
            alt={puppy.name}
            aspectRatio="aspect-square"
            className="rounded-t-lg"
          />
        ) : (
          <div className="aspect-square bg-gradient-to-br from-breeder-cream to-breeder-warm flex items-center justify-center rounded-t-lg">
            <Camera className="h-12 w-12 text-primary/50" />
          </div>
        )}
        
        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <Upload className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <ImageUploadDialog 
              onUpload={handleImageUpload}
              onClose={() => setShowImageUpload(false)}
              puppyName={puppy.name}
            />
          </Dialog>
          
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <Edit3 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit {puppy.name}</DialogTitle>
              </DialogHeader>
              <PuppyEditForm 
                editData={editData}
                setEditData={setEditData}
                onSave={handleUpdatePuppy}
                onCancel={() => setShowEditDialog(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleDeletePuppy}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`${getStatusColor(puppy.status)} shadow-sm`}>
            {puppy.status}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{puppy.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gender:</span>
            <span className="font-medium">{puppy.gender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Color:</span>
            <span className="font-medium">{puppy.color}</span>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Born:</span>
          <span className="font-medium">
            {new Date(puppy.birth_date).toLocaleDateString()}
          </span>
        </div>

        {puppy.estimated_adult_weight && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Weight:</span>
            <span className="font-medium">{puppy.estimated_adult_weight} lbs</span>
          </div>
        )}

        {puppy.microchip_id && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Microchip:</span>
            <span className="font-medium text-xs">{puppy.microchip_id}</span>
          </div>
        )}

        {puppy.notes && (
          <div className="mt-3 p-2 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground line-clamp-2">{puppy.notes}</p>
          </div>
        )}

        <div className="flex gap-1 pt-2">
          {['available', 'reserved', 'sold'].map((status) => (
            <Button
              key={status}
              variant={puppy.status === status ? "default" : "outline"}
              size="sm"
              className="text-xs capitalize flex-1"
              onClick={() => {
                if (puppy.id) {
                  api.updatePuppy(litterId, puppy.id, { status: status as any })
                    .then(() => onUpdate())
                    .catch((error) => {
                      console.error('Failed to update status:', error);
                      alert('Failed to update status. Please try again.');
                    });
                }
              }}
            >
              {status}
            </Button>
          ))}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Delete Puppy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Are you sure you want to delete <strong>"{puppy.name}"</strong>?
              </p>
              <p className="text-red-600">
                This action cannot be undone. All puppy data and images will be permanently deleted.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeletePuppy}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Puppy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Puppy Edit Form Component
function PuppyEditForm({ 
  editData, 
  setEditData, 
  onSave, 
  onCancel, 
  loading 
}: {
  editData: any;
  setEditData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Name *</Label>
          <Input
            id="edit-name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Puppy's name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-gender">Gender</Label>
          <select
            id="edit-gender"
            value={editData.gender}
            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-color">Color *</Label>
          <Input
            id="edit-color"
            value={editData.color}
            onChange={(e) => setEditData({ ...editData, color: e.target.value })}
            placeholder="e.g., Golden, Cream, Red"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-birth-date">Birth Date *</Label>
          <Input
            id="edit-birth-date"
            type="date"
            value={editData.birth_date}
            onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-weight">Est. Adult Weight (lbs)</Label>
          <Input
            id="edit-weight"
            type="number"
            value={editData.estimated_adult_weight}
            onChange={(e) => setEditData({ ...editData, estimated_adult_weight: e.target.value })}
            placeholder="45"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <select
            id="edit-status"
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-microchip">Microchip ID</Label>
        <Input
          id="edit-microchip"
          value={editData.microchip_id}
          onChange={(e) => setEditData({ ...editData, microchip_id: e.target.value })}
          placeholder="Microchip number"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="edit-notes">Notes</Label>
        <Textarea
          id="edit-notes"
          value={editData.notes}
          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
          placeholder="Any special notes about this puppy..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={onSave} disabled={loading} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// Image Upload Dialog Component
function ImageUploadDialog({ 
  onUpload, 
  onClose, 
  puppyName 
}: { 
  onUpload: (file: File) => void;
  onClose: () => void;
  puppyName: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Image for {puppyName}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="puppy-image">Select Image</Label>
          <Input
            id="puppy-image"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="mt-1"
          />
        </div>

        {preview && (
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file}
            className="flex-1"
          >
            Upload Image
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Bulk Puppy Management Component
export function BulkPuppyManagement({ 
  puppies, 
  litterId, 
  onUpdate 
}: {
  puppies: Puppy[];
  litterId: string;
  onUpdate: () => void;
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Puppy Management</h3>
          <p className="text-sm text-muted-foreground">
            {puppies.length} puppies total
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Puppy
            </Button>
          </DialogTrigger>
          <CreatePuppyDialog 
            litterId={litterId}
            onSuccess={() => {
              onUpdate();
              setShowCreateDialog(false);
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {puppies.map((puppy) => (
          <PuppyManagement
            key={puppy.id}
            puppy={puppy}
            litterId={litterId}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {puppies.length === 0 && (
        <Card className="breeder-card">
          <CardContent className="text-center py-8">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No puppies added yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add the first puppy to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Create Puppy Dialog Component
function CreatePuppyDialog({ 
  litterId, 
  onSuccess, 
  onCancel 
}: { 
  litterId: string; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    color: '',
    birth_date: '',
    estimated_adult_weight: '',
    status: 'available',
    microchip_id: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.color.trim() || !formData.birth_date.trim()) {
      alert("Please fill in all required fields: Name, Color, and Birth Date");
      return;
    }
    
    // Validate birth date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.birth_date)) {
      alert("Birth Date must be in YYYY-MM-DD format");
      return;
    }
    
    setLoading(true);

    try {
      await api.addPuppyToLitter(litterId, {
        name: formData.name.trim(),
        gender: formData.gender,
        color: formData.color.trim(),
        birth_date: formData.birth_date.trim(), // Required field
        estimated_adult_weight: formData.estimated_adult_weight ? parseFloat(formData.estimated_adult_weight) : undefined,
        status: formData.status as any,
        microchip_id: formData.microchip_id?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to create puppy:", error);
      alert("Failed to create puppy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    handleSubmit(new Event('submit') as any);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add New Puppy</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PuppyEditForm 
          editData={formData}
          setEditData={setFormData}
          onSave={handleSave}
          onCancel={onCancel}
          loading={loading}
        />
      </form>
    </DialogContent>
  );
} 