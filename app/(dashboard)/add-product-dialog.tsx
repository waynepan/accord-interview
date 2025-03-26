'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { insertProductSchema } from '@/lib/db';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddProductDialog({ open, onClose }: AddProductDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    imageUrl: string;
    status: 'active' | 'inactive' | 'archived';
    price: string;
  }>({
    name: '',
    imageUrl: '',
    status: 'active',
    price: ''
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const product = {
        name: formData.name,
        imageUrl: formData.imageUrl,
        status: formData.status,
        price: formData.price, // Keep as string for PostgreSQL numeric type
        stock: 0,
        availableAt: new Date()
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error adding product:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to add product'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as 'active' | 'inactive' | 'archived'
                  }))
                }
              >
                {['active', 'inactive', 'archived'].map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />
            </div>
            {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
