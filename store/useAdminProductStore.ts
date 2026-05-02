import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminProduct {
  id: string
  name: string
  category: 'Fish' | 'Birds' | 'Accessories'
  productType: 'live-fish' | 'fish-food' | 'single-item'
  optionGroupLabel?: string
  optionValues?: string[]
  subcategory: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  sku: string
  status: 'Active' | 'Low Stock' | 'Out of Stock'
  image: string
  featured: boolean
  createdAt: string
}

interface AdminProductStore {
  products: AdminProduct[]
  setProducts: (products: AdminProduct[]) => void
  upsertProduct: (product: AdminProduct) => void
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt' | 'status'>) => void
  updateProduct: (productId: string, updates: Omit<AdminProduct, 'id' | 'createdAt' | 'status'>) => void
  removeProduct: (productId: string) => void
}

const MAX_PERSISTED_IMAGE_LENGTH = 180000

const inferProductType = (product: Partial<AdminProduct>): AdminProduct['productType'] => {
  if (product.productType) {
    return product.productType
  }

  const haystack = `${product.name ?? ''} ${product.subcategory ?? ''} ${product.category ?? ''}`.toLowerCase()

  if (haystack.includes('food') || haystack.includes('pellet') || haystack.includes('feed')) {
    return 'fish-food'
  }

  if (product.category === 'Accessories') {
    return 'single-item'
  }

  return 'live-fish'
}

const getDefaultOptions = (productType: AdminProduct['productType']) => {
  if (productType === 'live-fish') {
    return {
      optionGroupLabel: 'Pack Size',
      optionValues: ['1 Fish', '2 Fish', '3 Fish', '4 Fish'],
    }
  }

  if (productType === 'fish-food') {
    return {
      optionGroupLabel: 'Weight',
      optionValues: ['100 gm', '200 gm', '500 gm', '1 kg'],
    }
  }

  return {
    optionGroupLabel: undefined,
    optionValues: [],
  }
}

const normalizeProduct = (product: AdminProduct): AdminProduct => {
  const productType = inferProductType(product)
  const defaultOptions = getDefaultOptions(productType)
  const normalizedImage =
    product.image.startsWith('blob:') || product.image.startsWith('file:')
      ? ''
      : product.image

  return {
    ...product,
    image: normalizedImage,
    productType,
    optionGroupLabel: product.optionGroupLabel ?? defaultOptions.optionGroupLabel,
    optionValues: product.optionValues ?? defaultOptions.optionValues,
    status: getStatus(product.stock),
  }
}

const sanitizeImageForPersistence = (image: string) => {
  if (image.startsWith('blob:') || image.startsWith('file:')) {
    return ''
  }

  if (image.startsWith('data:') && image.length > MAX_PERSISTED_IMAGE_LENGTH) {
    return ''
  }

  return image
}

const sanitizeProductForPersistence = (product: AdminProduct): AdminProduct => ({
  ...product,
  image: sanitizeImageForPersistence(product.image),
})

const getStatus = (stock: number): AdminProduct['status'] => {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'Active'
}

export const useAdminProductStore = create<AdminProductStore>()(
  persist(
    (set) => ({
      products: [],
      setProducts: (products) =>
        set({
          products: products.map(normalizeProduct),
        }),
      upsertProduct: (incomingProduct) =>
        set((state) => {
          const normalizedProduct = normalizeProduct(incomingProduct)
          const exists = state.products.some((product) => product.id === incomingProduct.id)

          return {
            products: exists
              ? state.products.map((product) =>
                  product.id === incomingProduct.id ? normalizedProduct : product
                )
              : [normalizedProduct, ...state.products],
          }
        }),
      addProduct: (product) =>
        set((state) => ({
          products: [
            normalizeProduct({
              ...product,
              id: `prod-${Date.now()}`,
              createdAt: new Date().toISOString(),
              status: getStatus(product.stock),
            }),
            ...state.products,
          ],
        })),
      updateProduct: (productId, updates) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? normalizeProduct({
                  ...product,
                  ...updates,
                  status: getStatus(updates.stock),
                })
              : product
          ),
        })),
      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== productId),
        })),
    }),
    {
      name: 'admin-product-store',
      partialize: (state) => ({
        products: state.products.map(sanitizeProductForPersistence),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AdminProductStore>

        return {
          ...currentState,
          ...persisted,
          products: (persisted.products ?? []).map(normalizeProduct),
        }
      },
    }
  )
)
