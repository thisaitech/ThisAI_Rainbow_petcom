import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirebaseClientAuth, hasFirebaseClientConfig } from '@/lib/firebase/client'

export const signInToFirebaseAdminSession = async (email: string, password: string) => {
  if (!hasFirebaseClientConfig) {
    return
  }

  const auth = getFirebaseClientAuth()
  await signInWithEmailAndPassword(auth, email, password)
}

export const signOutFirebaseSession = async () => {
  if (!hasFirebaseClientConfig) {
    return
  }

  const auth = getFirebaseClientAuth()

  if (!auth.currentUser) {
    return
  }

  await signOut(auth)
}
