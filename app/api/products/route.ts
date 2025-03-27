import { NextResponse } from 'next/server';
import { db, products, insertProductSchema } from '@/lib/db';
import { count } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ensure all required fields are present
    if (
      !body.name ||
      !body.imageUrl ||
      !body.status ||
      !body.price ||
      body.stock === undefined ||
      !body.availableAt
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get total count of products
    const totalProducts = await db.select({ count: count() }).from(products);
    const nextId = (totalProducts[0]?.count ?? 0) + 1;

    // Validate and transform the data
    const validatedData = {
      id: nextId,
      name: body.name,
      imageUrl: body.imageUrl,
      status: body.status,
      price: body.price,
      stock: body.stock,
      availableAt: new Date(body.availableAt)
    };

    // Validate against the schema
    const parsedData = insertProductSchema.parse(validatedData);

    // Insert into database
    await db.insert(products).values(parsedData);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
