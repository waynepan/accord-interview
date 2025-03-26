import { ProductsTabs } from './products-tabs';
import { getProducts } from '@/lib/db';

export default async function ProductsPage(props: {
  searchParams: Promise<{ q: string; offset: string; tab?: string; sort?: string; order?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const tab = searchParams.tab ?? 'all';
  const sort = searchParams.sort;
  const order = searchParams.order === 'desc' ? 'desc' : 'asc';

  const status = tab === 'all' ? undefined : tab === 'draft' ? 'inactive' : tab as 'active' | 'archived';
  const { products, newOffset, totalProducts } = await getProducts(
    search,
    Number(offset),
    status,
    sort as any,
    order
  );

  return (
    <ProductsTabs
      products={products}
      offset={newOffset ?? 0}
      totalProducts={totalProducts}
      currentTab={tab}
    />
  );
}
