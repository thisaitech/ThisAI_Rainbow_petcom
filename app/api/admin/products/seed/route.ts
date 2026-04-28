import { NextResponse } from 'next/server'
import { getDatabasePool } from '@/lib/database/client'
import { hasDatabaseEnv } from '@/lib/database/config'
import { seedCatalogProducts } from '@/lib/adminCatalogSeed'

export async function POST() {
  if (!hasDatabaseEnv) {
    return NextResponse.json({
      configured: false,
      demoMode: true,
      message: 'Default catalog is already available in local admin mode.',
    })
  }

  try {
    const pool = getDatabasePool()
    const seedProducts = seedCatalogProducts()

    for (const product of seedProducts) {
      await pool.query(
        `INSERT INTO products
        (id, name, category, subcategory, description, price, original_price, stock, sku, image, featured, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          category = VALUES(category),
          subcategory = VALUES(subcategory),
          description = VALUES(description),
          price = VALUES(price),
          original_price = VALUES(original_price),
          stock = VALUES(stock),
          sku = VALUES(sku),
          image = VALUES(image),
          featured = VALUES(featured),
          updated_at = NOW()`,
        [
          product.id,
          product.name,
          product.category,
          product.subcategory,
          product.description,
          product.price,
          product.originalPrice ?? null,
          product.stock,
          product.sku,
          product.image,
          product.featured ? 1 : 0,
          product.createdAt,
        ]
      )
    }

    return NextResponse.json({
      configured: true,
      message: `Imported ${seedProducts.length} catalog products into the database.`,
      count: seedProducts.length,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to import the default catalog.' },
      { status: 500 }
    )
  }
}
