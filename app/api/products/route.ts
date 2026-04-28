import { NextResponse } from 'next/server'
import { getDatabasePool } from '@/lib/database/client'
import { hasDatabaseEnv } from '@/lib/database/config'
import { DatabaseProductRow, mapDatabaseRowToAdminProduct } from '@/lib/database/products'

export async function GET() {
  if (!hasDatabaseEnv) {
    return NextResponse.json(
      { products: [], configured: false, message: 'Database is not configured.' }
    )
  }

  try {
    const pool = getDatabasePool()
    const [rows] = await pool.query(
      `SELECT id, name, category, subcategory, description, price, original_price, stock, sku, image, featured, created_at
       FROM products
       ORDER BY created_at DESC`
    )
    const products = (rows as DatabaseProductRow[]).map(mapDatabaseRowToAdminProduct)

    return NextResponse.json({
      products,
      configured: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        products: [],
        configured: false,
        message: error instanceof Error ? error.message : 'Failed to fetch products.',
      },
    )
  }
}
