import { NextResponse } from 'next/server'
import { hasDatabaseEnv } from '@/lib/database/config'
import { getDatabasePool } from '@/lib/database/client'
import { DatabaseProductRow, mapDatabaseRowToAdminProduct } from '@/lib/database/products'
import { deleteProductImageByUrl, saveProductImage } from '@/lib/database/storage'
import { AdminProduct } from '@/store/useAdminProductStore'

interface RouteContext {
  params: {
    id: string
  }
}

const normalizeCategory = (value: FormDataEntryValue | null): AdminProduct['category'] => {
  if (value === 'Birds' || value === 'Accessories') {
    return value
  }

  return 'Fish'
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!hasDatabaseEnv) {
    return NextResponse.json({
      configured: false,
      demoMode: true,
      message: 'Updated locally in demo mode.',
    })
  }

  try {
    const formData = await request.formData()
    const imageFile = formData.get('imageFile')
    const previousImage = String(formData.get('previousImage') || '')
    let imageUrl = String(formData.get('image') || previousImage || '')

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
    const [existingRows] = await pool.query(
      `SELECT id, image, created_at FROM products WHERE id = ? LIMIT 1`,
      [params.id]
    )
    const existingProduct = (existingRows as DatabaseProductRow[])[0]

    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 })
    }

    await pool.query(
      `UPDATE products
       SET name = ?, category = ?, subcategory = ?, description = ?, price = ?, original_price = ?, stock = ?, sku = ?, image = ?, featured = ?, updated_at = NOW()
       WHERE id = ?`,
      [
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
        params.id,
      ]
    )

    const [updatedRows] = await pool.query(
      `SELECT id, name, category, subcategory, description, price, original_price, stock, sku, image, featured, created_at
       FROM products WHERE id = ? LIMIT 1`,
      [params.id]
    )
    const updatedProduct = (updatedRows as DatabaseProductRow[])[0]

    if (previousImage && previousImage !== imageUrl) {
      await deleteProductImageByUrl(previousImage)
    }

    return NextResponse.json({
      product: mapDatabaseRowToAdminProduct(updatedProduct),
      message: 'Product updated in database.',
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update product.' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!hasDatabaseEnv) {
    return NextResponse.json({
      success: true,
      configured: false,
      demoMode: true,
      message: 'Deleted locally in demo mode.',
    })
  }

  try {
    const pool = getDatabasePool()
    const [rows] = await pool.query(
      `SELECT image FROM products WHERE id = ? LIMIT 1`,
      [params.id]
    )
    const existingProduct = (rows as DatabaseProductRow[])[0]

    if (!existingProduct) {
      return NextResponse.json({ success: true })
    }

    await pool.query(`DELETE FROM products WHERE id = ?`, [params.id])
    await deleteProductImageByUrl(existingProduct.image)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete product.' },
      { status: 500 }
    )
  }
}
