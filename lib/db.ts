import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, asc, desc } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);

export type SortField = keyof typeof products.$inferSelect;
export type SortOrder = 'asc' | 'desc';

export async function getProducts(
  search: string,
  offset: number,
  status?: 'active' | 'inactive' | 'archived',
  sortField?: SortField,
  sortOrder: SortOrder = 'asc'
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  let conditions = [];

  // Build conditions
  if (search) {
    conditions.push(ilike(products.name, `%${search}%`));
  }
  if (status) {
    conditions.push(eq(products.status, status));
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  // Get total count with filters
  const totalProducts = await db
    .select({ value: count() })
    .from(products)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .then((result) => result[0].value);

  // Build query with conditions, sorting, and pagination
  const query = db
    .select()
    .from(products)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(
      sortField
        ? sortOrder === 'desc'
          ? desc(products[sortField])
          : asc(products[sortField])
        : products.id
    )
    .limit(5)
    .offset(offset);

  const moreProducts = await query;

  const newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}
