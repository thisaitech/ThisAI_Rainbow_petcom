import {
  hasFirebaseClientConfig,
} from '@/lib/firebase/client'
import {
  loadFirebaseProductCatalog,
  type ProductCatalogResponse,
} from '@/lib/firebase/products'
export const loadProductCatalog = async (): Promise<ProductCatalogResponse> => {
  if (hasFirebaseClientConfig) {
    try {
      return await loadFirebaseProductCatalog()
    } catch (error) {
      return {
        configured: true,
        products: [],
        source: 'unavailable',
        message:
          error instanceof Error
            ? `Firebase product catalog is unavailable: ${error.message}`
            : 'Firebase product catalog is unavailable.',
      }
    }
  }

  return {
    configured: false,
    products: [],
    source: 'unavailable',
    message: 'Firebase is not configured for the product catalog yet.',
  }
}
