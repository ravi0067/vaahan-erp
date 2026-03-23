'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AddBrandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBrandDialog({ isOpen, onClose, onSuccess }: AddBrandDialogProps) {
  const [formData, setFormData] = useState({
    brandName: '',
    brandType: 'BIKE',
    logoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({ brandName: '', brandType: 'BIKE', logoUrl: '' });
      }
    } catch (error) {
      console.error('Error adding brand:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="brandName">Brand Name *</Label>
            <Input
              id="brandName"
              placeholder="e.g., KTM, Triumph, Hero"
              value={formData.brandName}
              onChange={(e) => setFormData({...formData, brandName: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="brandType">Vehicle Type *</Label>
            <Select 
              value={formData.brandType}
              onValueChange={(value) => setFormData({...formData, brandType: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BIKE">Two Wheeler (Bike)</SelectItem>
                <SelectItem value="CAR">Four Wheeler (Car)</SelectItem>
                <SelectItem value="EV">Electric Vehicle</SelectItem>
                <SelectItem value="SCOOTER">Scooter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Brand'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}