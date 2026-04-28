import { NextResponse } from 'next/server'
import { hasDatabaseEnv } from '@/lib/database/config'
import { getDatabasePool } from '@/lib/database/client'
import { mapDatabaseRowToAdminProduct, DatabaseProductRow } from '@/lib/database/products'
import { saveProductImage } from '@/lib/database/storage'
import { AdminProduct } from '@/store/useAdminProductStore'

const normalizeCategory = (value: FormDataEntryValue | null): AdminProduct['category'] => {
  if (value === 'Birds' || value === 'Accessories') {
    return value
  }

  return 'Fish'
}

export async function POST(request: Request) {
  if (!hasDatabaseEnv) {
    return NextResponse.json({
      configured: false,
      demoMode: true,
      message: 'Saved locally in demo mode.',
    })
  }

  try {
    const formData = await request.formData()
    const imageFile = formData.get('imageFile')
    const existingImage = String(formData.get('image') || '')

    let imageUrl = existingImage

    if (imageFile instanceof File && imageFile.size > 0) {
      const upload = await saveProductImage(imageFile)
      imageUrl = upload.publicUrl
    }

    if (!imageUrl) {
      return NextResponse.json({ message: 'Product image is required.' }, { status: 400 })
    }

    const payload = {
      name: String(formData.get('name') || '').trim(),
      category: normalizeCategory(formData.get('category')),
      subcategory: String(formData.get('subcategory') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      price: Number(formData.get('price') || 0),
      originalPrice: formData.get('originalPrice')
        ? Number(formData.get('originalPrice'))
        : null,
      stock: Number(formData.get('stock') || 0),
      sku: String(formData.get('sku') || '').trim(),
      image: imageUrl,
      featured: String(formData.get('featured') || '') === 'true',
    }

    const pool = getDatabasePool()
    const generatedId = crypto.randomUUID()
    await pool.query(
      `INSERT INTO products
      (id, name, category, subcategory, description, price, original_price, stock, sku, image, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        generatedId,
        payload.name,
        payload.category,
        payload.subcategory,
        payload.description,
        payload.price,
        payload.originalPrice,
        payload.stock,
        payload.sku,
        payload.image,
        payload.featured ? 1 : 0,
      ]
    )

    const [rows] = await pool.query(
      `SELECT id, name, category, subcategory, description, price, original_price, stock, sku, image, featured, created_at
       FROM products WHERE id = ? LIMIT 1`,
      [generatedId]
    )
    const createdProduct = (rows as DatabaseProductRow[])[0]

    return NextResponse.json({
      product: mapDatabaseRowToAdminProduct(createdProduct),
      message: 'Product saved to database.',
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create product.' },
      { status: 500 }
    )
  }
}
