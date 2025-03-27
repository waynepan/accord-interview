'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from './products-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelectProduct } from '@/lib/db';
import { AddProductDialog } from './add-product-dialog';
import { useState } from 'react';

interface ProductsTabsProps {
  products: SelectProduct[];
  offset: number;
  totalProducts: number;
  currentTab: string;
}

export function ProductsTabs({
  products,
  offset,
  totalProducts,
  currentTab
}: ProductsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    params.set('offset', '0'); // Reset offset when changing tabs
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="archived" className="hidden sm:flex">
            Archived
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={() => setShowAddProduct(true)}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
          <AddProductDialog
            open={showAddProduct}
            onClose={() => setShowAddProduct(false)}
          />
        </div>
      </div>
      <TabsContent value="all">
        <ProductsTable
          products={products}
          offset={offset}
          totalProducts={totalProducts}
        />
      </TabsContent>
      <TabsContent value="active">
        <ProductsTable
          products={products}
          offset={offset}
          totalProducts={totalProducts}
        />
      </TabsContent>
      <TabsContent value="draft">
        <ProductsTable
          products={products}
          offset={offset}
          totalProducts={totalProducts}
        />
      </TabsContent>
      <TabsContent value="archived">
        <ProductsTable
          products={products}
          offset={offset}
          totalProducts={totalProducts}
        />
      </TabsContent>
    </Tabs>
  );
}
