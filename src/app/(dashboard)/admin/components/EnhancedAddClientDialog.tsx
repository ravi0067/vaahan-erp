'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Building, MapPin, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Brand {
  brandName: string;
  brandType: 'BIKE' | 'CAR' | 'EV' | 'SCOOTER';
  locations: {
    locationName: string;
    address: string;
    phone: string;
    managerName: string;
  }[];
}

interface ClientForm {
  // Basic Info
  clientName: string;
  slug: string;
  plan: string;
  
  // Business Details  
  gstNumber: string;
  emailId: string;
  address: string;
  firmName: string;
  ownerName: string;
  phone: string;
  
  // System Config
  showroomType: 'BIKE' | 'CAR' | 'EV' | 'MULTI';
  currentFY: string;
  logoUrl: string;
  
  // Brands
  brands: Brand[];
}

interface EnhancedAddClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnhancedAddClientDialog({ isOpen, onClose, onSuccess }: EnhancedAddClientDialogProps) {
  const currentYear = new Date().getFullYear();
  const currentFY = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  const [formData, setFormData] = useState<ClientForm>({
    clientName: '',
    slug: '',
    plan: 'FREE',
    gstNumber: '',
    emailId: '',
    address: '',
    firmName: '',
    ownerName: '',
    phone: '',
    showroomType: 'BIKE',
    currentFY,
    logoUrl: '',
    brands: []
  });

  const [currentBrand, setCurrentBrand] = useState<Brand>({
    brandName: '',
    brandType: 'BIKE',
    locations: []
  });

  const [currentLocation, setCurrentLocation] = useState({
    locationName: '',
    address: '',
    phone: '',
    managerName: ''
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof ClientForm, value: any) => {
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
    if (!currentLocation.locationName || !currentLocation.address) {
      toast.error('Location name and address are required');
      return;
    }

    setCurrentBrand(prev => ({
      ...prev,
      locations: [...prev.locations, currentLocation]
    }));

    setCurrentLocation({
      locationName: '',
      address: '',
      phone: '',
      managerName: ''
    });
  };

  const removeLocation = (index: number) => {
    setCurrentBrand(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  const addBrand = () => {
    if (!currentBrand.brandName) {
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
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.brands.length === 0) {
      toast.error('Please add at least one brand');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Client onboarded successfully!');
        onSuccess();
        onClose();
        resetForm();
      } else {
        throw new Error('Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      slug: '',
      plan: 'FREE',
      gstNumber: '',
      emailId: '',
      address: '',
      firmName: '',
      ownerName: '',
      phone: '',
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
    setActiveTab('basic');
  };

  const isValid = formData.clientName && formData.slug && formData.ownerName && formData.brands.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Client - Complete Onboarding</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="system">System Config</TabsTrigger>
            <TabsTrigger value="brands">Brands & Locations</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto p-1">
            <TabsContent value="basic" className="space-y-4">
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

              <div>
                <Label htmlFor="plan">Subscription Plan</Label>
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
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div>
                <Label htmlFor="firmName">Firm/Company Name</Label>
                <Input
                  id="firmName"
                  placeholder="Legal business name"
                  value={formData.firmName}
                  onChange={(e) => updateFormData('firmName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    placeholder="e.g., 09ABCDE1234F1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                  />
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
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  placeholder="Complete address with pincode"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Showroom Type</Label>
                  <Select value={formData.showroomType} onValueChange={(value: any) => updateFormData('showroomType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">Two Wheeler (Bike/Scooter)</SelectItem>
                      <SelectItem value="CAR">Four Wheeler (Car)</SelectItem>
                      <SelectItem value="EV">Electric Vehicle</SelectItem>
                      <SelectItem value="MULTI">Multi-Vehicle (All Types)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Financial Year</Label>
                  <Input
                    value={formData.currentFY}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Auto-selected current FY</p>
                </div>
              </div>

              <div>
                <Label htmlFor="logoUrl">Company Logo URL (Optional)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => updateFormData('logoUrl', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="brands" className="space-y-6">
              {/* Current Brands */}
              {formData.brands.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Added Brands ({formData.brands.length})</h4>
                  <div className="space-y-3">
                    {formData.brands.map((brand, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-primary" />
                              <CardTitle className="text-sm">{brand.brandName}</CardTitle>
                              <Badge variant="secondary">{brand.brandType}</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeBrand(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {brand.locations.map((location, locIndex) => (
                              <div key={locIndex} className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{location.locationName}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Brand */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Add New Brand</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                        onValueChange={(value: any) => setCurrentBrand(prev => ({...prev, brandType: value}))}
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
                      <div className="space-y-2 mt-2">
                        {currentBrand.locations.map((location, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <p className="text-sm font-medium">{location.locationName}</p>
                              <p className="text-xs text-muted-foreground">{location.address}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLocation(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Location Form */}
                  <div className="border rounded p-4 space-y-3">
                    <Label className="text-sm font-medium">Add Showroom Location</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Location name (e.g., Chinhat Branch)"
                        value={currentLocation.locationName}
                        onChange={(e) => setCurrentLocation(prev => ({...prev, locationName: e.target.value}))}
                      />
                      <Input
                        placeholder="Manager name"
                        value={currentLocation.managerName}
                        onChange={(e) => setCurrentLocation(prev => ({...prev, managerName: e.target.value}))}
                      />
                    </div>
                    <Textarea
                      placeholder="Complete address"
                      value={currentLocation.address}
                      onChange={(e) => setCurrentLocation(prev => ({...prev, address: e.target.value}))}
                      rows={2}
                    />
                    <Input
                      placeholder="Phone number"
                      value={currentLocation.phone}
                      onChange={(e) => setCurrentLocation(prev => ({...prev, phone: e.target.value}))}
                    />
                    <Button size="sm" onClick={addLocation}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Location
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={addBrand} disabled={!currentBrand.brandName || currentBrand.locations.length === 0}>
                      <Building className="h-4 w-4 mr-2" />
                      Add Brand
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {formData.brands.length} brand(s) added
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}