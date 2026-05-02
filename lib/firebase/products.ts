import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import {
  getFirebaseClientDb,
  getFirebaseClientStorage,
  hasFirebaseClientConfig,
} from '@/lib/firebase/client'
import type { AdminProduct } from '@/store/useAdminProductStore'

export type ProductCatalogResponse = {
  configured: boolean
  message?: string
  products: AdminProduct[]
  source: 'firebase' | 'static-export' | 'unavailable'
}

type ProductDraft = Omit<AdminProduct, 'id' | 'createdAt' | 'status'>

type ProductDocument = {
  name?: string
  category?: AdminProduct['category']
  productType?: AdminProduct['productType']
  optionGroupLabel?: string | null
  optionValues?: string[]
  subcategory?: string
  description?: string
  price?: number
  originalPrice?: number | null
  stock?: number
  sku?: string
  image?: string
  featured?: boolean
  createdAt?: string
  updatedAt?: string
}

type SaveFirebaseProductInput = {
  product: ProductDraft
  imageFile?: File | null
  existingProduct?: AdminProduct | null
}

const PRODUCTS_COLLECTION = 'products'
const PRODUCT_IMAGES_PATH = 'product-images'

const createProductId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `product-${Date.now()}`

const inferProductType = (
  category: AdminProduct['category'],
  explicitType?: AdminProduct['productType']
): AdminProduct['productType'] => {
  if (explicitType === 'live-fish' || explicitType === 'fish-food' || explicitType === 'single-item') {
    return explicitType
  }

  return category === 'Accessories' ? 'single-item' : 'live-fish'
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
    optionValues: [] as string[],
  }
}

const getStatus = (stock: number): AdminProduct['status'] => {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'Active'
}

const sanitizeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')

const isFirebaseStorageUrl = (value?: string | null) =>
  Boolean(
    value &&
      (value.includes('firebasestorage.googleapis.com') ||
        value.startsWith('gs://') ||
        value.includes('/o/product-images%2F'))
  )

const normalizeCategory = (value?: string): AdminProduct['category'] => {
  if (value === 'Birds' || value === 'Accessories') {
    return value
  }

  return 'Fish'
}

const normalizeProduct = (id: string, product: ProductDocument): AdminProduct => {
  const category = normalizeCategory(product.category)
  const productType = inferProductType(category, product.productType)
  const defaultOptions = getDefaultOptions(productType)
  const stock = Number(product.stock ?? 0)

  return {
    id,
    name: String(product.name ?? ''),
    category,
    productType,
    optionGroupLabel:
      productType === 'single-item'
        ? undefined
        : product.optionGroupLabel ?? defaultOptions.optionGroupLabel,
    optionValues:
      productType === 'single-item'
        ? []
        : Array.isArray(product.optionValues) && product.optionValues.length > 0
          ? product.optionValues
          : defaultOptions.optionValues,
    subcategory: String(product.subcategory ?? category),
    description: String(product.description ?? ''),
    price: Number(product.price ?? 0),
    originalPrice:
      typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
    stock,
    sku: String(product.sku ?? id),
    image: String(product.image ?? ''),
    featured: Boolean(product.featured),
    createdAt: String(product.createdAt ?? new Date().toISOString()),
    status: getStatus(stock),
  }
}

const buildProductDocument = ({
  id,
  product,
  imageUrl,
  createdAt,
}: {
  id: string
  product: ProductDraft
  imageUrl: string
  createdAt: string
}): ProductDocument => ({
  name: product.name,
  category: normalizeCategory(product.category),
  productType: inferProductType(product.category, product.productType),
  optionGroupLabel:
    product.productType === 'single-item' ? null : product.optionGroupLabel ?? null,
  optionValues: product.productType === 'single-item' ? [] : product.optionValues ?? [],
  subcategory: product.subcategory,
  description: product.description,
  price: Number(product.price),
  originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : null,
  stock: Number(product.stock),
  sku: product.sku || id,
  image: imageUrl,
  featured: Boolean(product.featured),
  createdAt,
  updatedAt: new Date().toISOString(),
})

const uploadProductImage = async (productId: string, imageFile: File) => {
  const storage = getFirebaseClientStorage()
  const fileName = `${Date.now()}-${sanitizeFileName(imageFile.name || 'product-image')}`
  const storageRef = ref(storage, `${PRODUCT_IMAGES_PATH}/${productId}/${fileName}`)

  await uploadBytes(storageRef, imageFile)

  return getDownloadURL(storageRef)
}

const deleteProductImageIfOwned = async (imageUrl?: string | null) => {
  if (!imageUrl || !isFirebaseStorageUrl(imageUrl)) {
    return
  }

  const storage = getFirebaseClientStorage()
  await deleteObject(ref(storage, imageUrl)).catch(() => undefined)
}

const ensureFirebaseConfig = () => {
  if (!hasFirebaseClientConfig) {
    throw new Error('Firebase is not configured for this app yet.')
  }
}

export const loadFirebaseProductCatalog = async (): Promise<ProductCatalogResponse> => {
  ensureFirebaseConfig()

  const db = getFirebaseClientDb()
  const productQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(productQuery)

  return {
    configured: true,
    products: snapshot.docs.map((entry) =>
      normalizeProduct(entry.id, entry.data() as ProductDocument)
    ),
    source: 'firebase',
  }
}

export const saveProductToFirebase = async ({
  product,
  imageFile,
  existingProduct,
}: SaveFirebaseProductInput) => {
  ensureFirebaseConfig()

  const id = existingProduct?.id || createProductId()
  const currentImage = existingProduct?.image || ''
  let nextImageUrl = product.image || currentImage

  if (imageFile) {
    nextImageUrl = await uploadProductImage(id, imageFile)
  }

  if (!nextImageUrl || nextImageUrl.startsWith('blob:') || nextImageUrl.startsWith('file:')) {
    throw new Error('A valid product image is required.')
  }

  const createdAt = existingProduct?.createdAt || new Date().toISOString()
  const db = getFirebaseClientDb()
  const productDocRef = doc(db, PRODUCTS_COLLECTION, id)

  await setDoc(
    productDocRef,
    buildProductDocument({
      id,
      product,
      imageUrl: nextImageUrl,
      createdAt,
    })
  )

  if (imageFile && currentImage && currentImage !== nextImageUrl) {
    await deleteProductImageIfOwned(currentImage)
  }

  const savedProductSnapshot = await getDoc(productDocRef)

  return {
    product: normalizeProduct(
      savedProductSnapshot.id,
      savedProductSnapshot.data() as ProductDocument
    ),
    message: existingProduct
      ? 'Product updated in Firebase.'
      : 'Product saved to Firebase.',
  }
}

export const deleteProductFromFirebase = async (productId: string) => {
  ensureFirebaseConfig()

  const db = getFirebaseClientDb()
  const productDocRef = doc(db, PRODUCTS_COLLECTION, productId)
  const snapshot = await getDoc(productDocRef)
  const existingProduct = snapshot.data() as ProductDocument | undefined

  await deleteDoc(productDocRef)
  await deleteProductImageIfOwned(existingProduct?.image)
}
