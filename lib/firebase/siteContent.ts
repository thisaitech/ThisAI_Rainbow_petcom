import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseClientDb, hasFirebaseClientConfig } from '@/lib/firebase/client'
import {
  businessProfile,
  customerReviews,
  homeHeroSlides,
  type BusinessProfile,
  type CustomerReview,
  type HeroSlideContent,
} from '@/lib/siteContent'

export type SiteContent = {
  businessProfile: BusinessProfile
  homeHeroSlides: HeroSlideContent[]
  customerReviews: CustomerReview[]
  source: 'firebase' | 'fallback'
}

const SITE_CONTENT_COLLECTION = 'siteContent'

const readDocData = async <T>(documentId: string): Promise<T | null> => {
  const snapshot = await getDoc(doc(getFirebaseClientDb(), SITE_CONTENT_COLLECTION, documentId))
  return snapshot.exists() ? (snapshot.data() as T) : null
}

export const loadFirebaseSiteContent = async (): Promise<SiteContent> => {
  if (!hasFirebaseClientConfig) {
    return {
      businessProfile,
      homeHeroSlides,
      customerReviews,
      source: 'fallback',
    }
  }

  try {
    const [businessDoc, heroDoc, reviewsDoc] = await Promise.all([
      readDocData<Partial<BusinessProfile>>('businessProfile'),
      readDocData<{ slides?: HeroSlideContent[] }>('homeHero'),
      readDocData<{ reviews?: CustomerReview[] }>('customerReviews'),
    ])

    return {
      businessProfile: {
        ...businessProfile,
        ...(businessDoc || {}),
      },
      homeHeroSlides:
        Array.isArray(heroDoc?.slides) && heroDoc.slides.length > 0
          ? heroDoc.slides
          : homeHeroSlides,
      customerReviews:
        Array.isArray(reviewsDoc?.reviews) && reviewsDoc.reviews.length > 0
          ? reviewsDoc.reviews
          : customerReviews,
      source: businessDoc || heroDoc || reviewsDoc ? 'firebase' : 'fallback',
    }
  } catch {
    return {
      businessProfile,
      homeHeroSlides,
      customerReviews,
      source: 'fallback',
    }
  }
}
