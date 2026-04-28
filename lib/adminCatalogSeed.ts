import type { Product } from '@/lib/store'
import { products as mainCatalogProducts } from '@/lib/data'
import { birdsAndFishProducts } from '@/lib/birdsAndFishData'
import type { AdminProduct } from '@/store/useAdminProductStore'

const titleCase = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()

const inferAdminCategory = (product: Product): AdminProduct['category'] => {
  if (product.category === 'accessories' || product.subcategory === 'fish-accessories') {
    return 'Accessories'
  }

  if (product.category === 'birds-fish' && product.subcategory === 'birds') {
    return 'Birds'
  }

  return 'Fish'
}

const inferProductType = (product: Product): AdminProduct['productType'] => {
  const haystack = `${product.name} ${product.subcategory ?? ''} ${product.category}`.toLowerCase()

  if (haystack.includes('food') || haystack.includes('pellet') || haystack.includes('feed')) {
    return 'fish-food'
  }

  if (product.category === 'aquarium-fish' || product.category === 'birds-fish') {
    return 'live-fish'
  }

  return 'single-item'
}

const inferOptionGroupLabel = (productType: AdminProduct['productType']) => {
  if (productType === 'live-fish') return 'Pack Size'
  if (productType === 'fish-food') return 'Weight'
  return undefined
}

const inferOptionValues = (productType: AdminProduct['productType']) => {
  if (productType === 'live-fish') {
    return ['1 Fish', '2 Fish', '3 Fish', '4 Fish']
  }

  if (productType === 'fish-food') {
    return ['100 gm', '200 gm', '500 gm', '1 kg']
  }

  return []
}

const inferSubcategoryLabel = (product: Product) => {
  if (product.specifications?.Subcategory) {
    return product.specifications.Subcategory
  }

  if (product.subcategory) {
    return titleCase(product.subcategory)
  }

  return titleCase(product.category)
}

const inferStock = (product: Product) => {
  const stockValue = product.specifications?.Stock
  const parsedStock = stockValue ? Number.parseInt(stockValue, 10) : Number.NaN

  if (Number.isFinite(parsedStock)) {
    return parsedStock
  }

  return product.inStock ? 25 : 0
}

const inferSku = (product: Product) => {
  if (product.specifications?.SKU) {
    return product.specifications.SKU
  }

  return product.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')
}

export const seedCatalogProducts = (): AdminProduct[] => {
  const allSourceProducts = [...mainCatalogProducts, ...birdsAndFishProducts]

  return allSourceProducts.map((product, index) => {
    const stock = inferStock(product)
    const productType = inferProductType(product)

    return {
      id: product.id,
      name: product.name,
      category: inferAdminCategory(product),
      productType,
      optionGroupLabel: inferOptionGroupLabel(productType),
      optionValues: inferOptionValues(productType),
      subcategory: inferSubcategoryLabel(product),
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock,
      sku: inferSku(product),
      status: stock <= 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'Active',
      image: product.images[0] || '',
      featured: Boolean(product.isFeatured),
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, index, 0)).toISOString(),
    }
  })
}

const seedCatalogSnapshot = seedCatalogProducts()

export const seedCatalogProductIds = new Set(seedCatalogSnapshot.map((product) => product.id))
export const seedCatalogProductSkus = new Set(seedCatalogSnapshot.map((product) => product.sku))
