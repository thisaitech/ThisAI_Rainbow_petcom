import { doc, setDoc } from 'firebase/firestore'
import { getFirebaseClientDb, hasFirebaseClientConfig } from '@/lib/firebase/client'
import type { Order } from '@/store/useAuthStore'

const ORDERS_COLLECTION = 'orders'

export const saveOrderToFirebase = async (order: Order) => {
  if (!hasFirebaseClientConfig) {
    return { saved: false, message: 'Firebase is not configured.' }
  }

  await setDoc(doc(getFirebaseClientDb(), ORDERS_COLLECTION, order.id), order)

  return { saved: true, message: 'Order saved to Firebase.' }
}
