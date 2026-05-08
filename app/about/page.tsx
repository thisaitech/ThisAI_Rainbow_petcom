'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { 
  Heart, 
  Award, 
  Users, 
  Truck, 
  Shield,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  CheckCircle,
  PawPrint,
  ArrowRight
} from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import PetCategoriesSection from '@/components/pets/PetCategoriesSection'
import { businessProfile } from '@/lib/siteContent'

const stats = [
  { icon: Heart, value: '1,00,000+', label: 'Happy Pets' },
  { icon: Award, value: '5+', label: 'Years Experience' },
  { icon: Users, value: '50,000+', label: 'Pet Parents Trust Us' },
  { icon: Truck, value: '500+', label: 'Cities Delivered' },
]

const timeline = [
  {
    year: '2019',
    title: 'The Beginning',
    description: 'Started as a small pet shop in Tirunelveli with a dream to provide quality pet products.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    year: '2020',
    title: 'Going Online',
    description: 'Launched our e-commerce platform to serve pet parents across Tamil Nadu.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
  },
  {
    year: '2022',
    title: 'Pan India Expansion',
    description: 'Expanded delivery to 500+ cities across India with same-day delivery in major metros.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
  },
  {
    year: '2024',
    title: 'BowPaw Today',
    description: 'Now serving over 1 lakh happy pets with premium products and exceptional service.',
    image: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=400',
  },
]

const team = [
  {
    name: 'Karthik Rajan',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    bio: 'Pet lover since childhood, started BowPaw to make pet parenting easier.',
  },
  {
    name: 'Priya Lakshmi',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    bio: 'Ensures every order reaches your doorstep on time with care.',
  },
  {
    name: 'Dr. Senthil Kumar',
    role: 'Veterinary Advisor',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    bio: '15+ years experience, curates our health & nutrition products.',
  },
  {
    name: 'Meera Sundaram',
    role: 'Customer Happiness',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    bio: 'Always ready to help you find the perfect products for your pets.',
  },
]

const values = [
  {
    icon: Heart,
    title: 'Pet-First Approach',
    description: 'Every product we sell is tested and approved by pet experts.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: '100% genuine products with easy returns and refunds.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same-day delivery in Tirunelveli, 2-5 days across India.',
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: 'Our team includes vets and pet care specialists.',
  },
]

export default function AboutPage() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 overflow-hidden text-slate-800">
      <Navigation />
      {/* Hero Section with Parallax */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920"
            alt="Happy pets"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/50 to-dark/80" />
        
        {/* Floating Elements */}
        <motion.span
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 right-[15%] text-6xl opacity-30"
        >
          🐾
        </motion.span>
        <motion.span
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-40 left-[10%] text-5xl opacity-30"
        >
          🦴
        </motion.span>

        <div className="relative h-full flex items-center">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <span className="text-secondary-400 font-semibold text-lg">Our Story</span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mt-4 mb-6">
                Where Every Pet is <span className="text-secondary-400">Family</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
                From a small pet store in Tirunelveli to India&apos;s most loved pet e-commerce brand. 
                We&apos;re on a mission to make pet parenting joyful and affordable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary w-full sm:w-auto text-base sm:text-lg px-7 py-3.5"
                  >
                    <span>Shop Now</span>
                  </motion.button>
                </Link>
                <a href="#contact">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary w-full sm:w-auto text-base sm:text-lg px-7 py-3.5 border-white text-white hover:bg-white hover:text-dark"
                  >
                    Contact Us
                  </motion.button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative text-slate-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 cursor-pointer transition-all"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="font-heading font-bold text-3xl md:text-4xl text-dark mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-20 bg-slate-50 text-slate-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-500 font-semibold text-lg">Our Journey</span>
            <h2 className="section-title mt-2">From Tirunelveli to All of India</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-secondary-500 hidden md:block" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-8 mb-16 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}
                    className={`bg-white p-6 sm:p-8 rounded-2xl shadow-lg ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-full mb-4">
                      {item.year}
                    </span>
                    <h3 className="font-heading font-bold text-2xl text-dark mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600">{item.description}</p>
                  </motion.div>
                </div>

                {/* Timeline Dot */}
                <motion.div
                  whileHover={{ scale: 1.5 }}
                  className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full border-4 border-white shadow-lg z-10"
                />

                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-slate-100 p-1"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover p-1"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white relative overflow-hidden">
        <motion.div
          style={{ y: y2 }}
          className="absolute inset-0 opacity-10"
        >
          <div className="absolute inset-0 paw-bg" />
        </motion.div>

        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-white/80 font-semibold text-lg">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-2">Our Values</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <value.icon className="w-8 h-8" />
                </motion.div>
                <h3 className="font-heading font-bold text-xl mb-3">{value.title}</h3>
                <p className="text-white/80 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white text-slate-800">
        <div className="container-custom px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-500 font-semibold text-lg">Meet the Pack</span>
            <h2 className="section-title mt-2">Our Amazing Team</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-2xl p-3 shadow-sm border border-slate-100"
              >
                <div className="relative overflow-hidden rounded-xl mb-4 bg-slate-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover p-1 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm">{member.bio}</p>
                  </div>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 px-1">{member.name}</h3>
                <p className="text-primary-600 text-sm px-1 pb-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location Section */}
      <section id="contact" className="py-20 bg-slate-50 text-slate-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-500 font-semibold text-lg">Get in Touch</span>
            <h2 className="section-title mt-2">Visit Our Store</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Come visit us at our flagship store in Tirunelveli or reach out online!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl">
                <h3 className="font-heading font-bold text-2xl mb-6">{businessProfile.name}</h3>
                
                <div className="space-y-5">
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Store Address</h4>
                      <p className="text-slate-600 leading-relaxed">
                        {businessProfile.addressLines[0]}<br />
                        {businessProfile.addressLines[1]}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-secondary-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Phone</h4>
                      <p className="text-slate-600 leading-relaxed">
                        Call / WhatsApp: {businessProfile.phoneDisplay}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Email</h4>
                      <p className="text-slate-600 leading-relaxed break-all">
                        {businessProfile.email}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Store Hours</h4>
                      <p className="text-slate-600 leading-relaxed">
                        Open daily: 9 am-11 pm<br />
                        <span className="text-secondary-500 font-medium">Please call to confirm live pet availability.</span>
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Features */}
                <div className="mt-8 pt-8 border-t grid grid-cols-2 gap-4">
                  {['Free Parking', 'Pet-Friendly Store', 'Vet On-Site (Sat)', 'Grooming Available'].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-5 h-5 text-secondary-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-full min-h-[400px]"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.8976823882677!2d77.69374731478257!3d8.727612493714756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04119e3bacd855%3A0x9f3b8d6b3e5e2e0a!2sTirunelveli%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rainbow Aquarium & Pets Store Location - Tirunelveli"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pet Breeds Showcase */}
      <section id="pet-categories" className="bg-white">
        <PetCategoriesSection showTitle={true} maxPetsPerCategory={6} />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark text-white relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full"
        />
        
        <div className="container-custom relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-6xl mb-6 block">🐾</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
              Ready to Find Your Perfect Pet?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join over 1 lakh happy pet parents who trust BowPaw for healthy pets and quality products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  <span>Browse Pets & Products</span>
                </motion.button>
              </Link>
              <a href={`tel:${businessProfile.phone}`}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-semibold hover:bg-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

