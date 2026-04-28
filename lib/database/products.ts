import { AdminProduct } from '@/store/useAdminProductStore'

export interface DatabaseProductRow {
  id: string
  name: string
  category: AdminProduct['category']
  subcategory: string
  description: string
  price: number
  original_price: number | null
  stock: number
  sku: string
  image: string
  featured: number | boolean
  created_at: string | Date
}

const getStatus = (stock: number): AdminProduct['status'] => {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'Active'
}

export const mapDatabaseRowToAdminProduct = (row: DatabaseProductRow): AdminProduct => ({
  id: String(row.id),
  name: row.name,
  category: row.category,
  productType: row.category === 'Accessories' ? 'single-item' : 'live-fish',
  optionGroupLabel: row.category === 'Accessories' ? undefined : 'Pack Size',
  optionValues: row.category === 'Accessories' ? [] : ['1 Fish', '2 Fish', '3 Fish', '4 Fish'],
  subcategory: row.subcategory,
  description: row.description,
  price: Number(row.price),
  originalPrice: row.original_price ?? undefined,
  stock: Number(row.stock),
  sku: row.sku,
  image: row.image,
  featured: Boolean(row.featured),
  createdAt:
    typeof row.created_at === 'string'
      ? row.created_at
      : row.created_at.toISOString(),
  status: getStatus(Number(row.stock)),
})
