import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

import { api } from '../lib/api';
import { Plus, Camera, X } from 'lucide-react';

// Step 1: Litter Information
export function LitterInfoStep({ data, onChange, errors, clearError }: {
  data: any;
  onChange: (data: any) => void;
  errors?: { name?: string };
  clearError?: (field: string) => void;
}) {
  const handleChange = (field: string, value: string | boolean) => {
    onChange({ ...data, [field]: value });
    // Clear validation error when user starts typing
    if (clearError && typeof value === 'string' && value.trim()) {
      clearError(field);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Litter Information</h3>
        <p className="text-sm text-muted-foreground">Enter the essential details about this litter</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="litter-name" className="flex items-center gap-1">
            Litter Name 
            <span className="text-red-500 font-medium">*</span>
          </Label>
          <Input
            id="litter-name"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Spring 2024 Litter"
            className={`mt-1 ${errors?.name ? 'border-red-500 focus:border-red-500' : ''}`}
            required
          />
          {errors?.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
          {!errors?.name && (
            <p className="text-xs text-muted-foreground mt-1">Choose a memorable name for this litter</p>
          )}
        </div>

        <div>
          <Label htmlFor="breed">Breed</Label>
          <select
            id="breed"
            value={data.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="Goldendoodle">Goldendoodle</option>
            <option value="Bernedoodle">Bernedoodle</option>
            <option value="Labradoodle">Labradoodle</option>
            <option value="Saint Berdoodle">Saint Berdoodle</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="generation">Generation</Label>
          <select
            id="generation"
            value={data.generation}
            onChange={(e) => handleChange('generation', e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="F1">F1 (First Generation)</option>
            <option value="F1B">F1B (F1 Backcross)</option>
            <option value="F1BB">F1BB (F1 Double Backcross)</option>
            <option value="F2">F2 (Second Generation)</option>
            <option value="F2B">F2B (F2 Backcross)</option>
            <option value="F2BB">F2BB (F2 Double Backcross)</option>
            <option value="F3/Multigen">F3/Multigen (Third Generation+)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="birth-date">Birth Date</Label>
          <Input
            id="birth-date"
            type="date"
            value={data.birth_date}
            onChange={(e) => handleChange('birth_date', e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">Leave empty if not born yet</p>
        </div>

        <div>
          <Label htmlFor="expected-date">Expected Date</Label>
          <Input
            id="expected-date"
            type="date"
            value={data.expected_date}
            onChange={(e) => handleChange('expected_date', e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">Due date if not born yet</p>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Tell families about this special litter..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is-current"
          checked={data.is_current}
          onChange={(e) => handleChange('is_current', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is-current" className="font-normal">
          Mark as current/active litter (will appear on public website)
        </Label>
      </div>
    </div>
  );
}

// Step 2: Parent Information
export function ParentInfoStep({ data, onChange, isEdit = false, litterId, errors, clearError }: {
  data: any;
  onChange: (data: any) => void;
  isEdit?: boolean;
  litterId?: string;
  errors?: { 
    mother?: { name?: string; breed?: string; color?: string };
    father?: { name?: string; breed?: string; color?: string };
  };
  clearError?: (field: string, parent: 'mother' | 'father') => void;
}) {
  const [uploadingMotherImage, setUploadingMotherImage] = useState(false);
  const [uploadingFatherImage, setUploadingFatherImage] = useState(false);
  const [showHealthClearanceDialog, setShowHealthClearanceDialog] = useState(false);
  const [healthClearanceParent, setHealthClearanceParent] = useState<'mother' | 'father'>('mother');
  const [healthClearanceText, setHealthClearanceText] = useState('');
  const handleMotherChange = (field: string, value: string) => {
    onChange({
      ...data,
      mother: { ...data.mother, [field]: value }
    });
    // Clear validation error when user starts typing
    if (clearError && value.trim()) {
      clearError(field, 'mother');
    }
  };

  const handleFatherChange = (field: string, value: string) => {
    onChange({
      ...data,
      father: { ...data.father, [field]: value }
    });
    // Clear validation error when user starts typing
    if (clearError && value.trim()) {
      clearError(field, 'father');
    }
  };

  const addHealthClearance = (parent: 'mother' | 'father') => {
    setHealthClearanceParent(parent);
    setHealthClearanceText('');
    setShowHealthClearanceDialog(true);
  };

  const handleHealthClearanceSubmit = () => {
    if (healthClearanceText.trim()) {
      onChange({
        ...data,
        [healthClearanceParent]: {
          ...data[healthClearanceParent],
          health_clearances: [...data[healthClearanceParent].health_clearances, healthClearanceText.trim()]
        }
      });
      setShowHealthClearanceDialog(false);
      setHealthClearanceText('');
    }
  };

  const removeHealthClearance = (parent: 'mother' | 'father', index: number) => {
    onChange({
      ...data,
      [parent]: {
        ...data[parent],
        health_clearances: data[parent].health_clearances.filter((_: any, i: number) => i !== index)
      }
    });
  };

  const handleMotherImageUpload = async (file: File) => {
    if (!isEdit || !litterId) return;
    
    setUploadingMotherImage(true);
    try {
      const response = await api.uploadMotherImage(litterId, file);
      onChange({
        ...data,
        mother: {
          ...data.mother,
          image_url: response.image_url
        }
      });
    } catch (error) {
      console.error('Failed to upload mother image:', error);
    } finally {
      setUploadingMotherImage(false);
    }
  };

  const handleFatherImageUpload = async (file: File) => {
    if (!isEdit || !litterId) return;
    
    setUploadingFatherImage(true);
    try {
      const response = await api.uploadFatherImage(litterId, file);
      onChange({
        ...data,
        father: {
          ...data.father,
          image_url: response.image_url
        }
      });
    } catch (error) {
      console.error('Failed to upload father image:', error);
    } finally {
      setUploadingFatherImage(false);
    }
  };

  const handleDeleteMotherImage = async () => {
    if (!isEdit || !litterId) return;
    
    try {
      await api.deleteMotherImage(litterId);
      onChange({
        ...data,
        mother: {
          ...data.mother,
          image_url: undefined
        }
      });
    } catch (error) {
      console.error('Failed to delete mother image:', error);
    }
  };

  const handleDeleteFatherImage = async () => {
    if (!isEdit || !litterId) return;
    
    try {
      await api.deleteFatherImage(litterId);
      onChange({
        ...data,
        father: {
          ...data.father,
          image_url: undefined
        }
      });
    } catch (error) {
      console.error('Failed to delete father image:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Parent Information</h3>
        <p className="text-sm text-muted-foreground">Details about the mother and father of this litter</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mother Information */}
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-pink-600">♀</span>
              Mother (Dam)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mother-name" className="flex items-center gap-1">
                Name 
                <span className="text-red-500 font-medium">*</span>
              </Label>
              <Input
                id="mother-name"
                value={data.mother.name}
                onChange={(e) => handleMotherChange('name', e.target.value)}
                placeholder="Mother's registered name"
                className={`mt-1 ${errors?.mother?.name ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
              {errors?.mother?.name && (
                <p className="text-sm text-red-600 mt-1">{errors.mother.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mother-breed" className="flex items-center gap-1">
                Breed 
                <span className="text-red-500 font-medium">*</span>
              </Label>
              <Input
                id="mother-breed"
                value={data.mother.breed}
                onChange={(e) => handleMotherChange('breed', e.target.value)}
                placeholder="e.g., Golden Retriever, Poodle"
                className={`mt-1 ${errors?.mother?.breed ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
              {errors?.mother?.breed && (
                <p className="text-sm text-red-600 mt-1">{errors.mother.breed}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mother-color" className="flex items-center gap-1">
                Color 
                <span className="text-red-500 font-medium">*</span>
              </Label>
              <Input
                id="mother-color"
                value={data.mother.color}
                onChange={(e) => handleMotherChange('color', e.target.value)}
                placeholder="e.g., Golden, Cream, Red"
                className={`mt-1 ${errors?.mother?.color ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
              {errors?.mother?.color && (
                <p className="text-sm text-red-600 mt-1">{errors.mother.color}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mother-weight">Weight (lbs)</Label>
              <Input
                id="mother-weight"
                type="number"
                value={data.mother.weight || ''}
                onChange={(e) => handleMotherChange('weight', e.target.value)}
                placeholder="60"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Health Clearances</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addHealthClearance('mother')}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {data.mother.health_clearances.map((clearance: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">{clearance}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHealthClearance('mother', index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {data.mother.health_clearances.length === 0 && (
                  <p className="text-xs text-muted-foreground">No health clearances added yet</p>
                )}
              </div>
            </div>

            {/* Mother Image Upload */}
            <div>
              <Label>Mother's Photo</Label>
              <div className="mt-2">
                {data.mother.image_url ? (
                  <div className="relative inline-block">
                    <img 
                      src={data.mother.image_url} 
                      alt={data.mother.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    {isEdit && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={handleDeleteMotherImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {isEdit && (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMotherImageUpload(file);
                      }}
                      disabled={uploadingMotherImage}
                      className="mt-2"
                    />
                    {uploadingMotherImage && (
                      <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                    )}
                  </>
                )}
                {!isEdit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Images can be uploaded after creating the litter
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Father Information */}
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-blue-600">♂</span>
              Father (Sire)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="father-name" className="flex items-center gap-1">
                Name 
                <span className="text-red-500 font-medium">*</span>
              </Label>
              <Input
                id="father-name"
                value={data.father.name}
                onChange={(e) => handleFatherChange('name', e.target.value)}
                placeholder="Father's registered name"
                className={`mt-1 ${errors?.father?.name ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
              {errors?.father?.name && (
                <p className="text-sm text-red-600 mt-1">{errors.father.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="father-breed" className="flex items-center gap-1">
                Breed 
                <span className="text-red-500 font-medium">*</span>
              </Label>
              <Input
                id="father-breed"
                value={data.father.breed}
                onChange={(e) => handleFatherChange('breed', e.target.value)}
                placeholder="e.g., Standard Poodle, Golden Retriever"
                className={`mt-1 ${errors?.father?.breed ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
              {errors?.father?.breed && (
                <p className="text-sm text-red-600 mt-1">{errors.father.breed}</p>
              )}
            </div>

            <div>
              <Label htmlFor="father-color" className="flex items-center gap-1">
                Color 
                <span className="text-red-500 font-medium">*</span>
              </Label>
              <Input
                id="father-color"
                value={data.father.color}
                onChange={(e) => handleFatherChange('color', e.target.value)}
                placeholder="e.g., Cream, Apricot, Black"
                className={`mt-1 ${errors?.father?.color ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
              {errors?.father?.color && (
                <p className="text-sm text-red-600 mt-1">{errors.father.color}</p>
              )}
            </div>

            <div>
              <Label htmlFor="father-weight">Weight (lbs)</Label>
              <Input
                id="father-weight"
                type="number"
                value={data.father.weight || ''}
                onChange={(e) => handleFatherChange('weight', e.target.value)}
                placeholder="70"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Health Clearances</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addHealthClearance('father')}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {data.father.health_clearances.map((clearance: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">{clearance}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHealthClearance('father', index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {data.father.health_clearances.length === 0 && (
                  <p className="text-xs text-muted-foreground">No health clearances added yet</p>
                )}
              </div>
            </div>

            {/* Father Image Upload */}
            <div>
              <Label>Father's Photo</Label>
              <div className="mt-2">
                {data.father.image_url ? (
                  <div className="relative inline-block">
                    <img 
                      src={data.father.image_url} 
                      alt={data.father.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    {isEdit && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={handleDeleteFatherImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {isEdit && (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFatherImageUpload(file);
                      }}
                      disabled={uploadingFatherImage}
                      className="mt-2"
                    />
                    {uploadingFatherImage && (
                      <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                    )}
                  </>
                )}
                {!isEdit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Images can be uploaded after creating the litter
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Clearance Dialog */}
      <Dialog open={showHealthClearanceDialog} onOpenChange={setShowHealthClearanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Health Clearance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="health-clearance">Health Clearance</Label>
              <Input
                id="health-clearance"
                value={healthClearanceText}
                onChange={(e) => setHealthClearanceText(e.target.value)}
                placeholder='e.g., "OFA Hips: Good", "PRA: Clear"'
                className="mt-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleHealthClearanceSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowHealthClearanceDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleHealthClearanceSubmit}
                disabled={!healthClearanceText.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Step 3: Puppy Information
export function PuppyInfoStep({ puppies, onChange, litterBirthDate }: {
  puppies: any[];
  onChange: (puppies: any[]) => void;
  litterBirthDate: string;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPuppy, setNewPuppy] = useState({
    name: '',
    gender: 'Male',
    color: '',
    birth_date: litterBirthDate || '',
    estimated_adult_weight: '',
    status: 'available' as 'available' | 'reserved' | 'sold',
    microchip_id: '',
    notes: '',
    images: [] as File[]
  });

  const [puppyValidationError, setPuppyValidationError] = useState('')

  const handleAddPuppy = () => {
    // Validate required fields and data types
    const validationErrors = []
    if (!newPuppy.name.trim()) validationErrors.push("Name is required")
    if (!newPuppy.color.trim()) validationErrors.push("Color is required")
    
    // Validate birth_date - REQUIRED field
    if (!newPuppy.birth_date || !newPuppy.birth_date.trim()) {
      validationErrors.push("Birth Date is required")
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(newPuppy.birth_date)) {
        validationErrors.push("Birth Date must be in YYYY-MM-DD format")
      }
    }
    
    // Validate estimated_adult_weight if provided
    if (newPuppy.estimated_adult_weight && newPuppy.estimated_adult_weight.trim()) {
      const weight = parseFloat(newPuppy.estimated_adult_weight)
      if (isNaN(weight) || weight <= 0) {
        validationErrors.push("Estimated Adult Weight must be a positive number")
      }
    }
    
    if (validationErrors.length > 0) {
      setPuppyValidationError(validationErrors.join("; "))
      return
    }
    
    // Clear any previous validation error
    setPuppyValidationError('')
    
    // Add puppy with sanitized data
    onChange([...puppies, { 
      ...newPuppy,
      name: newPuppy.name.trim(),
      color: newPuppy.color.trim(),
      birth_date: newPuppy.birth_date.trim(), // Required field
      estimated_adult_weight: newPuppy.estimated_adult_weight && newPuppy.estimated_adult_weight.trim() 
        ? parseFloat(newPuppy.estimated_adult_weight) 
        : '',
      microchip_id: newPuppy.microchip_id?.trim() || '',
      notes: newPuppy.notes?.trim() || ''
    }]);
    setNewPuppy({
      name: '',
      gender: 'Male',
      color: '',
      birth_date: litterBirthDate || '',
      estimated_adult_weight: '',
      status: 'available',
      microchip_id: '',
      notes: '',
      images: []
    });
    setShowAddForm(false);
  };

  const handleRemovePuppy = (index: number) => {
    onChange(puppies.filter((_, i) => i !== index));
  };



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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Puppy Information</h3>
          <p className="text-sm text-muted-foreground">
            Add individual puppies to this litter ({puppies.length} puppies added)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            ℹ️ This step is optional - you can create the litter first and add puppies later
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Puppy
        </Button>
      </div>

      {/* Add Puppy Form */}
      {showAddForm && (
        <Card className="breeder-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Add New Puppy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="puppy-name" className="flex items-center gap-1">
                  Name 
                  <span className="text-red-500 font-medium">*</span>
                </Label>
                <Input
                  id="puppy-name"
                  value={newPuppy.name}
                  onChange={(e) => {
                    setNewPuppy({ ...newPuppy, name: e.target.value })
                    if (e.target.value.trim()) setPuppyValidationError('')
                  }}
                  placeholder="Puppy's name"
                  className={`mt-1 ${!newPuppy.name.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="puppy-gender">Gender</Label>
                <select
                  id="puppy-gender"
                  value={newPuppy.gender}
                  onChange={(e) => setNewPuppy({ ...newPuppy, gender: e.target.value })}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="puppy-color" className="flex items-center gap-1">
                  Color 
                  <span className="text-red-500 font-medium">*</span>
                </Label>
                <Input
                  id="puppy-color"
                  value={newPuppy.color}
                  onChange={(e) => {
                    setNewPuppy({ ...newPuppy, color: e.target.value })
                    if (e.target.value.trim()) setPuppyValidationError('')
                  }}
                  placeholder="e.g., Golden, Cream, Red"
                  className={`mt-1 ${!newPuppy.color.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="puppy-birth-date" className="flex items-center gap-1">
                  Birth Date 
                  <span className="text-red-500 font-medium">*</span>
                </Label>
                <Input
                  id="puppy-birth-date"
                  type="date"
                  value={newPuppy.birth_date}
                  onChange={(e) => {
                    setNewPuppy({ ...newPuppy, birth_date: e.target.value })
                    if (e.target.value.trim()) setPuppyValidationError('')
                  }}
                  className={`mt-1 ${!newPuppy.birth_date ? 'border-red-300 focus:border-red-500' : ''}`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="puppy-weight">Est. Adult Weight (lbs)</Label>
                <Input
                  id="puppy-weight"
                  type="number"
                  value={newPuppy.estimated_adult_weight}
                  onChange={(e) => setNewPuppy({ ...newPuppy, estimated_adult_weight: e.target.value })}
                  placeholder="45"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="puppy-status">Status</Label>
                <select
                  id="puppy-status"
                  value={newPuppy.status}
                  onChange={(e) => setNewPuppy({ ...newPuppy, status: e.target.value as any })}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="puppy-microchip">Microchip ID</Label>
              <Input
                id="puppy-microchip"
                value={newPuppy.microchip_id}
                onChange={(e) => setNewPuppy({ ...newPuppy, microchip_id: e.target.value })}
                placeholder="Microchip number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="puppy-notes">Notes</Label>
              <Textarea
                id="puppy-notes"
                value={newPuppy.notes}
                onChange={(e) => setNewPuppy({ ...newPuppy, notes: e.target.value })}
                placeholder="Special notes about this puppy..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="puppy-images">Puppy Images</Label>
              <Input
                id="puppy-images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewPuppy({ ...newPuppy, images: e.target.files ? Array.from(e.target.files) : [] })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">You can select multiple images</p>
            </div>

            {puppyValidationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{puppyValidationError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddPuppy}
                disabled={!newPuppy.name || !newPuppy.color || !newPuppy.birth_date}
                className="flex-1"
              >
                Add Puppy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Puppies List */}
      {puppies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {puppies.map((puppy, index) => (
            <Card key={index} className="breeder-card">
              <div className="relative">
                {puppy.images && puppy.images.length > 0 ? (
                  <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(puppy.images[0])} 
                      alt={puppy.name}
                      className="w-full h-full object-cover"
                    />
                    {puppy.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        +{puppy.images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-breeder-cream to-breeder-warm flex items-center justify-center rounded-t-lg">
                    <Camera className="h-8 w-8 text-primary/50" />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 left-2 h-6 w-6 p-0"
                  onClick={() => handleRemovePuppy(index)}
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="absolute bottom-2 right-2">
                  <Badge className={`text-xs ${getStatusColor(puppy.status)}`}>
                    {puppy.status}
                  </Badge>
                </div>
              </div>

              <CardContent className="pt-3">
                <h4 className="font-medium mb-2">{puppy.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span>{puppy.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color:</span>
                    <span>{puppy.color}</span>
                  </div>
                  {puppy.estimated_adult_weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Weight:</span>
                      <span>{puppy.estimated_adult_weight} lbs</span>
                    </div>
                  )}
                </div>
                {puppy.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{puppy.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!showAddForm && puppies.length === 0 && (
        <Card className="breeder-card">
          <CardContent className="text-center py-8">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No puppies added yet</p>
            <p className="text-sm text-muted-foreground">Add puppies to this litter to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Step 4: Review & Create
export function ReviewStep({ litterData, puppies, isEdit }: {
  litterData: any;
  puppies: any[];
  isEdit?: boolean;
}) {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{isEdit ? 'Review Changes' : 'Review & Create Litter'}</h3>
        <p className="text-sm text-muted-foreground">
          Please review all information before {isEdit ? 'updating' : 'creating'} the litter
        </p>
      </div>

      {/* Litter Information Summary */}
      <Card className="breeder-card">
        <CardHeader>
          <CardTitle>Litter Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{litterData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Breed:</span>
              <span>{litterData.breed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Generation:</span>
              <span>{litterData.generation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={litterData.is_current ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}>
                {litterData.is_current ? 'Current' : 'Past'}
              </Badge>
            </div>
            {litterData.birth_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Birth Date:</span>
                <span>{new Date(litterData.birth_date).toLocaleDateString()}</span>
              </div>
            )}
            {litterData.expected_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Date:</span>
                <span>{new Date(litterData.expected_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {litterData.description && (
            <div>
              <span className="text-muted-foreground text-sm">Description:</span>
              <p className="text-sm mt-1">{litterData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent Information Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-pink-600">♀</span>
              Mother (Dam)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{litterData.mother.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Breed:</span>
              <span>{litterData.mother.breed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span>{litterData.mother.color}</span>
            </div>
            {litterData.mother.weight && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <span>{litterData.mother.weight} lbs</span>
              </div>
            )}
            {litterData.mother.health_clearances.length > 0 && (
              <div>
                <span className="text-muted-foreground">Health Clearances:</span>
                <div className="mt-1 space-y-1">
                  {litterData.mother.health_clearances.map((clearance: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs mr-1">
                      {clearance}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="breeder-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-blue-600">♂</span>
              Father (Sire)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{litterData.father.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Breed:</span>
              <span>{litterData.father.breed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span>{litterData.father.color}</span>
            </div>
            {litterData.father.weight && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <span>{litterData.father.weight} lbs</span>
              </div>
            )}
            {litterData.father.health_clearances.length > 0 && (
              <div>
                <span className="text-muted-foreground">Health Clearances:</span>
                <div className="mt-1 space-y-1">
                  {litterData.father.health_clearances.map((clearance: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs mr-1">
                      {clearance}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Puppies Summary */}
      {puppies.length > 0 && (
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle>Puppies ({puppies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {puppies.map((puppy, index) => (
                <div key={index} className="border border-border/20 rounded-lg p-3 bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{puppy.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(puppy.status)}`}>
                      {puppy.status}
                    </Badge>
                  </div>
                  
                  {puppy.images && puppy.images.length > 0 && (
                    <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                      <img 
                        src={URL.createObjectURL(puppy.images[0])} 
                        alt={puppy.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span>{puppy.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{puppy.color}</span>
                    </div>
                    {puppy.estimated_adult_weight && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Weight:</span>
                        <span>{puppy.estimated_adult_weight} lbs</span>
                      </div>
                    )}
                    {puppy.images && puppy.images.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Images:</span>
                        <span>{puppy.images.length} photo{puppy.images.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {puppies.length === 0 && (
        <Card className="breeder-card">
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">No puppies added to this litter</p>
            <p className="text-sm text-muted-foreground mt-1">You can add puppies later if needed</p>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Ready to Create Litter?</h4>
        <p className="text-sm text-blue-700">
          Once you create this litter, it will be added to your admin dashboard. 
          {litterData.is_current && " Since it's marked as current, it will also appear on your public website."}
          You can always edit the information or add more puppies later.
        </p>
      </div>
    </div>
  );
} 