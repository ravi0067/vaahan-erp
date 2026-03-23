'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Building } from 'lucide-react';
import { toast } from 'sonner';

interface Brand {
  brandName: string;
  brandType: string;
  locations: string[]; // Simplified - just location names
}

interface SimpleEnhancedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SimpleEnhancedDialog({ isOpen, onClose, onSuccess }: SimpleEnhancedDialogProps) {
  const currentYear = new Date().getFullYear();
  const currentFY = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  const [formData, setFormData] = useState({
    clientName: '',
    slug: '',
    plan: 'FREE',
    ownerName: '',
    phone: '',
    gstNumber: '',
    emailId: '',
    address: '',
    firmName: '',
    showroomType: 'BIKE',
    currentFY,
    logoUrl: '',
    brands: [] as Brand[]
  });

  const [currentBrand, setCurrentBrand] = useState({
    brandName: '',
    brandType: 'BIKE',
    locations: [] as string[]
  });

  const [newLocation, setNewLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-generate slug from client name
  const handleClientNameChange = (name: string) => {
    updateFormData('clientName', name);
    if (!formData.slug) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      updateFormData('slug', slug);
    }
  };

  const addLocation = () => {
    if (!newLocation.trim()) {
      toast.error('Location name is required');
      return;
    }

    setCurrentBrand(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation.trim()]
    }));
    setNewLocation('');
  };

  const removeLocation = (index: number) => {
    setCurrentBrand(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  const addBrand = () => {
    if (!currentBrand.brandName.trim()) {
      toast.error('Brand name is required');
      return;
    }

    if (currentBrand.locations.length === 0) {
      toast.error('At least one location is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      brands: [...prev.brands, currentBrand]
    }));

    setCurrentBrand({
      brandName: '',
      brandType: 'BIKE',
      locations: []
    });

    toast.success('Brand added successfully');
  };

  const removeBrand = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.clientName || !formData.slug || !formData.ownerName) {
      toast.error('Please fill client name, slug, and owner name');
      return;
    }

    if (formData.brands.length === 0) {
      toast.error('Please add at least one brand');
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform data for API
      const apiData = {
        clientName: formData.clientName,
        slug: formData.slug,
        plan: formData.plan,
        ownerName: formData.ownerName,
        phone: formData.phone,
        gstNumber: formData.gstNumber,
        emailId: formData.emailId,
        address: formData.address,
        firmName: formData.firmName,
        showroomType: formData.showroomType,
        currentFY: formData.currentFY,
        logoUrl: formData.logoUrl,
        brands: formData.brands.map(brand => ({
          brandName: brand.brandName,
          brandType: brand.brandType,
          locations: brand.locations.map(locationName => ({
            locationName,
            address: `${locationName}, ${formData.address}`,
            phone: formData.phone,
            managerName: ''
          }))
        }))
      };

      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        toast.success('Client onboarded successfully!');
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create client');
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      slug: '',
      plan: 'FREE',
      ownerName: '',
      phone: '',
      gstNumber: '',
      emailId: '',
      address: '',
      firmName: '',
      showroomType: 'BIKE',
      currentFY,
      logoUrl: '',
      brands: []
    });
    setCurrentBrand({
      brandName: '',
      brandType: 'BIKE',
      locations: []
    });
  };

  const isValid = formData.clientName && formData.slug && formData.ownerName && formData.brands.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client - Enhanced Onboarding</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="e.g., Honda Motors Delhi"
                  value={formData.clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g., honda-delhi"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  placeholder="Dealership owner full name"
                  value={formData.ownerName}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+91-9876543210"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firmName">Firm/Company Name</Label>
                <Input
                  id="firmName"
                  placeholder="Legal business name"
                  value={formData.firmName}
                  onChange={(e) => updateFormData('firmName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g., 09ABCDE1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emailId">Email ID</Label>
              <Input
                id="emailId"
                type="email"
                placeholder="business@example.com"
                value={formData.emailId}
                onChange={(e) => updateFormData('emailId', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                placeholder="Complete address with pincode"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* System Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">System Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => updateFormData('plan', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free (₹0/month)</SelectItem>
                    <SelectItem value="PRO">Pro (₹2999/month)</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise (₹9999/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Showroom Type</Label>
                <Select value={formData.showroomType} onValueChange={(value) => updateFormData('showroomType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIKE">Two Wheeler</SelectItem>
                    <SelectItem value="CAR">Four Wheeler</SelectItem>
                    <SelectItem value="EV">Electric Vehicle</SelectItem>
                    <SelectItem value="MULTI">Multi-Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Financial Year</Label>
                <Input value={formData.currentFY} disabled className="bg-muted" />
              </div>
            </div>
          </div>

          {/* Brands & Locations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Brands & Locations</h3>
            
            {/* Current Brands Display */}
            {formData.brands.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Added Brands ({formData.brands.length})</h4>
                {formData.brands.map((brand, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="font-medium">{brand.brandName}</span>
                        <span className="text-sm text-muted-foreground">({brand.brandType})</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Locations: {brand.locations.join(', ')}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeBrand(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Brand Form */}
            <div className="border rounded p-4 space-y-3">
              <h4 className="font-medium">Add New Brand</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    placeholder="e.g., KTM, Triumph, Hero"
                    value={currentBrand.brandName}
                    onChange={(e) => setCurrentBrand(prev => ({...prev, brandName: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Vehicle Type</Label>
                  <Select 
                    value={currentBrand.brandType}
                    onValueChange={(value) => setCurrentBrand(prev => ({...prev, brandType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">Two Wheeler</SelectItem>
                      <SelectItem value="CAR">Four Wheeler</SelectItem>
                      <SelectItem value="EV">Electric Vehicle</SelectItem>
                      <SelectItem value="SCOOTER">Scooter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Locations for current brand */}
              {currentBrand.locations.length > 0 && (
                <div>
                  <Label className="text-sm">Locations ({currentBrand.locations.length})</Label>
                  <div className="space-y-1 mt-2">
                    {currentBrand.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <span>{location}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeLocation(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Input
                  placeholder="Location name (e.g., Chinhat Branch, Ring Road Branch)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <Button size="sm" onClick={addLocation}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={addBrand} disabled={!currentBrand.brandName || currentBrand.locations.length === 0}>
                  <Building className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {formData.brands.length} brand(s) • {formData.brands.reduce((sum, b) => sum + b.locations.length, 0)} location(s)
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}