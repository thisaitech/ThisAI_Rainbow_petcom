import type { AdminProduct } from '@/store/useAdminProductStore'

export type ProductCatalogResponse = {
  configured: boolean
  message?: string
  products: AdminProduct[]
  source: 'api' | 'static-export' | 'unavailable'
}

const LIVE_PRODUCTS_URL = '/api/products'
const STATIC_PRODUCTS_URL = '/products.json'
const isStaticExportBuild = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'

const normalizeCatalogResponse = (
  payload: Partial<ProductCatalogResponse> & { products?: AdminProduct[] },
  source: ProductCatalogResponse['source']
): ProductCatalogResponse => ({
  configured: Boolean(payload.configured),
  message: payload.message,
  products: payload.products ?? [],
  source,
})

const fetchCatalog = async (
  requestUrl: string,
  source: ProductCatalogResponse['source'],
  cache: RequestCache = 'no-store'
) => {
  const response = await fetch(requestUrl, { cache })

  if (!response.ok) {
    throw new Error(`Catalog request failed with ${response.status}`)
  }

  const payload = (await response.json()) as Partial<ProductCatalogResponse> & {
    products?: AdminProduct[]
  }

  return normalizeCatalogResponse(payload, source)
}

const loadStaticCatalog = async () => fetchCatalog(STATIC_PRODUCTS_URL, 'static-export', 'force-cache')

export const loadProductCatalog = async (): Promise<ProductCatalogResponse> => {
  if (isStaticExportBuild) {
    try {
      return await loadStaticCatalog()
    } catch {
      return {
        configured: false,
        products: [],
        source: 'unavailable',
        message: 'Static product feed is not available.',
      }
    }
  }

  try {
    return await fetchCatalog(LIVE_PRODUCTS_URL, 'api')
  } catch {
    try {
      return await loadStaticCatalog()
    } catch {
      return {
        configured: false,
        products: [],
        source: 'unavailable',
        message: 'Product catalog is not available right now.',
      }
    }
  }
}
