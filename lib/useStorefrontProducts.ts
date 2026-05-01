'use client'

import { useEffect, useMemo, useState } from 'react'
import { Product } from '@/lib/store'
import { loadProductCatalog } from '@/lib/productCatalogClient'
import { AdminProduct, useAdminProductStore } from '@/store/useAdminProductStore'

const fallbackStorefrontImage =
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const mapAdminProductToStorefrontProduct = (product: AdminProduct): Product => {
  const category =
    product.category === 'Accessories'
      ? 'accessories'
      : product.category === 'Birds'
        ? 'birds-fish'
        : 'aquarium-fish'

  return {
    id: product.id,
    name: product.name,
    slug: slugify(product.name),
    category,
    subcategory: slugify(product.subcategory || product.category),
    price: product.price,
    originalPrice: product.originalPrice,
    images: [product.image || fallbackStorefrontImage],
    description: product.description,
    careGuide: 'Please contact the store for detailed care guidance for this product.',
    specifications: {
      SKU: product.sku,
      Category: product.category,
      Subcategory: product.subcategory || product.category,
      Stock: String(product.stock),
    },
    variants:
      product.optionGroupLabel && product.optionValues && product.optionValues.length > 0
        ? [{ name: product.optionGroupLabel, options: product.optionValues }]
        : [],
    inStock: product.stock > 0,
    isNew: true,
    isFeatured: product.featured,
    rating: 4.5,
    reviews: 0,
    tags: [
      slugify(product.category),
      slugify(product.subcategory || product.category),
      slugify(product.productType),
      'admin-added',
    ],
  }
}

export function useStorefrontProducts() {
  const localProducts = useAdminProductStore((state) => state.products)
  const [remoteProducts, setRemoteProducts] = useState<AdminProduct[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      try {
        const data = await loadProductCatalog()
        if (!cancelled) {
          setRemoteProducts(data.products.length > 0 ? data.products : null)
        }
      } catch {
        if (!cancelled) {
          setRemoteProducts(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const adminProducts = remoteProducts ?? localProducts

  const mappedProducts = useMemo(
    () => adminProducts.map(mapAdminProductToStorefrontProduct),
    [adminProducts]
  )

  const storefrontProducts = useMemo(
    () => mappedProducts,
    [mappedProducts]
  )

  const birdsAndFishProducts = useMemo(
    () =>
      mappedProducts
        .filter(
          (product) =>
            product.category === 'aquarium-fish' ||
            product.category === 'birds-fish' ||
            product.category === 'accessories'
        )
        .map((product) => ({
          ...product,
          category: 'birds-fish',
          subcategory:
            product.category === 'birds-fish'
              ? 'birds'
              : product.subcategory === 'accessories'
                ? 'fish-accessories'
                : 'freshwater-fish',
        })),
    [mappedProducts]
  )

  const allProducts = useMemo(
    () => {
      const productsById = new Map<string, Product>()

      for (const product of [...storefrontProducts, ...birdsAndFishProducts]) {
        if (!productsById.has(product.id)) {
          productsById.set(product.id, product)
        }
      }

      return Array.from(productsById.values())
    },
    [storefrontProducts, birdsAndFishProducts]
  )

  return {
    storefrontProducts,
    birdsAndFishProducts,
    allProducts,
    isLoading,
  }
}
