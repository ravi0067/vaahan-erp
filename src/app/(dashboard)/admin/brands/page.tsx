'use client';

import { useState, useEffect } from 'react';
import { Plus, Building, MapPin, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddBrandDialog } from './components/AddBrandDialog';
import { AddLocationDialog } from './components/AddLocationDialog';

interface Brand {
  id: string;
  brandName: string;
  brandType: string;
  logoUrl?: string;
  showroomLocations: Array<{
    id: string;
    locationName: string;
    address: string;
    phone?: string;
  }>;
  _count: { vehicles: number };
}

export default function BrandsManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = (brandId: string) => {
    setSelectedBrandId(brandId);
    setIsAddLocationOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading brands...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Brand & Location Management</h2>
          <p className="text-muted-foreground">
            Manage your dealership brands (KTM, Triumph) and showroom locations
          </p>
        </div>
        <Button onClick={() => setIsAddBrandOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Brands Added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first brand (like KTM, Triumph) to get started
            </p>
            <Button onClick={() => setIsAddBrandOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {brands.map((brand) => (
            <Card key={brand.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl} 
                        alt={brand.brandName}
                        className="h-10 w-10 object-contain rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{brand.brandName}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{brand.brandType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {brand._count.vehicles} vehicles
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Showroom Locations ({brand.showroomLocations.length})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddLocation(brand.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Location
                    </Button>
                  </div>

                  {brand.showroomLocations.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No locations added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {brand.showroomLocations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">{location.locationName}</p>
                            <p className="text-xs text-muted-foreground">{location.address}</p>
                            {location.phone && (
                              <p className="text-xs text-blue-600">{location.phone}</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddBrandDialog 
        isOpen={isAddBrandOpen}
        onClose={() => setIsAddBrandOpen(false)}
        onSuccess={fetchBrands}
      />

      <AddLocationDialog
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        brandId={selectedBrandId}
        onSuccess={fetchBrands}
      />
    </div>
  );
}