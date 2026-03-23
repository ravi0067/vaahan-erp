'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AddLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  onSuccess: () => void;
}

export function AddLocationDialog({ isOpen, onClose, brandId, onSuccess }: AddLocationDialogProps) {
  const [formData, setFormData] = useState({
    locationName: '',
    address: '',
    phone: '',
    managerName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          brandId
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({ locationName: '', address: '', phone: '', managerName: '' });
      }
    } catch (error) {
      console.error('Error adding location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Showroom Location</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="locationName">Location Name *</Label>
            <Input
              id="locationName"
              placeholder="e.g., Chinhat KTM Branch"
              value={formData.locationName}
              onChange={(e) => setFormData({...formData, locationName: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              placeholder="Complete showroom address with pincode"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+91-9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="managerName">Branch Manager</Label>
            <Input
              id="managerName"
              placeholder="Manager name (optional)"
              value={formData.managerName}
              onChange={(e) => setFormData({...formData, managerName: e.target.value})}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}