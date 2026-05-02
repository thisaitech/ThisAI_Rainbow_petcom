export type BusinessHour = {
  day: string
  hours: string
}

export type BusinessProfile = {
  name: string
  shortName: string
  category: string
  rating: number
  reviewCount: number
  addressLines: string[]
  phone: string
  phoneDisplay: string
  email: string
  hours: BusinessHour[]
  mapUrl: string
  directionsUrl: string
}

export type HeroSlideContent = {
  title: string
  subtitle: string
  description: string
  cta: string
  link: string
  image: string
  badge: string
}

export type CustomerReview = {
  id: string | number
  name: string
  location: string
  avatar: string
  rating: number
  text: string
  product: string
  source: string
}

export const businessProfile: BusinessProfile = {
  name: 'Rainbow Aquarium & Pets',
  shortName: 'Rainbow Aqua',
  category: 'Birds Shop / Aquarium / Pets Food',
  rating: 4.4,
  reviewCount: 370,
  addressLines: [
    'Near, No: 11B & C, Palayamkottai Railway Station Rd',
    'Palayamkottai, Tirunelveli, Tamil Nadu 627002',
  ],
  phone: '+918870777420',
  phoneDisplay: '088707 77420',
  email: 'hello@rainbowaquarium.in',
  hours: [
    { day: 'Monday', hours: '9 am-11 pm' },
    { day: 'Tuesday', hours: '9 am-11 pm' },
    { day: 'Wednesday', hours: '9 am-11 pm' },
    { day: 'Thursday', hours: '9 am-11 pm' },
    { day: 'Friday', hours: '9 am-11 pm' },
    { day: 'Saturday', hours: '9 am-11 pm' },
    { day: 'Sunday', hours: '9 am-11 pm' },
  ],
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Rainbow%20Aquarium%20%26%20Pets%20Palayamkottai%20Tirunelveli',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Rainbow%20Aquarium%20%26%20Pets%20Palayamkottai%20Tirunelveli',
}

export const homeHeroSlides: HeroSlideContent[] = [
  {
    title: 'Rainbow Aquarium & Pets',
    subtitle: 'Aquarium Fish, Birds & Pet Food in Tirunelveli',
    description:
      'Visit our Palayamkottai store for aquarium fish, birds, tanks, pet food, and everyday pet care supplies with friendly local guidance.',
    cta: 'Shop Products',
    link: '/shop',
    image: '/screenshots/shop.png',
    badge: 'LOCAL STORE',
  },
  {
    title: 'Healthy Fish & Aquarium Setup',
    subtitle: 'Tanks, filters, food and live fish',
    description:
      'Build a clean, beautiful aquarium with fish, accessories, food, and setup support from the Rainbow Aquarium & Pets team.',
    cta: 'Explore Fish',
    link: '/shop/aquarium-fish',
    image: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=1920',
    badge: 'AQUARIUM CARE',
  },
  {
    title: 'Birds, Pets & Daily Supplies',
    subtitle: 'Food, cages, accessories and guidance',
    description:
      'Find pet food, bird supplies, aquarium essentials, and accessories for families across Tirunelveli and nearby areas.',
    cta: 'Shop Birds',
    link: '/shop/birds',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1920',
    badge: 'PET SUPPLIES',
  },
]

export const customerReviews: CustomerReview[] = [
  {
    id: 'google-review-dr-v',
    name: 'Dr V',
    location: 'Google review',
    avatar: 'https://ui-avatars.com/api/?name=Dr+V&background=0ea5e9&color=fff',
    rating: 5,
    text:
      'Thank you so much for our cute little four leg boy. My mom was very happy, and the owner delivered the pet safely.',
    product: 'Pet delivery',
    source: 'Google',
  },
  {
    id: 'google-review-shankar',
    name: 'Shankar Shanu',
    location: 'Local Guide on Google',
    avatar: 'https://ui-avatars.com/api/?name=Shankar+Shanu&background=14b8a6&color=fff',
    rating: 5,
    text:
      'I purchased an aquarium setup from here. Mr. Manikandan was very cooperative in all aspects, one of the best pet shops in Palayamkottai.',
    product: 'Aquarium setup',
    source: 'Google',
  },
]
