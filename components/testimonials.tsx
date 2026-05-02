"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Verified, 
  Heart,
  MessageCircle,
  Fish,
  Bird
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessProfile, customerReviews, type CustomerReview } from "@/lib/siteContent";
import { loadFirebaseSiteContent } from "@/lib/firebase/siteContent";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

interface TestimonialModalProps {
  testimonial: CustomerReview;
  isOpen: boolean;
  onClose: () => void;
}

function TestimonialModal({ testimonial, isOpen, onClose }: TestimonialModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header gradient */}
            <div className="h-24 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 relative">
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  background: [
                    "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)",
                    "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 50%, #06b6d4 100%)",
                    "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #0ea5e9 100%)",
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full 
                          flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="relative -mt-12 flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden"
              >
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-1 right-1/2 translate-x-8 w-7 h-7 bg-emerald-500 rounded-full 
                          flex items-center justify-center border-2 border-white"
              >
                <Verified className="w-4 h-4 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 text-center">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-slate-800"
              >
                {testimonial.name}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-slate-500 text-sm"
              >
                {testimonial.location}
              </motion.p>

              {/* Stars */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-1 my-4"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        i < testimonial.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <Quote className="w-8 h-8 text-sky-200 absolute -top-2 -left-2" />
                <p className="text-slate-600 leading-relaxed text-lg italic px-4">
                  "{testimonial.text}"
                </p>
              </motion.div>

              {/* Product Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 px-4 py-2">
                  <Fish className="w-4 h-4 mr-2" />
                  Purchased: {testimonial.product}
                </Badge>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center gap-4 mt-6"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Helpful
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Reply
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Testimonials() {
  const swiperRef = useRef<SwiperType | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [reviews, setReviews] = useState<CustomerReview[]>(customerReviews);
  const [rating, setRating] = useState(businessProfile.rating);
  const [reviewCount, setReviewCount] = useState(businessProfile.reviewCount);
  const [selectedTestimonial, setSelectedTestimonial] = useState<CustomerReview | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    loadFirebaseSiteContent().then((content) => {
      if (mounted) {
        setReviews(content.customerReviews);
        setRating(content.businessProfile.rating);
        setReviewCount(content.businessProfile.reviewCount);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-sky-50 overflow-hidden relative"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating fish icons */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-5xl opacity-10"
        >
          🐠
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-20 text-4xl opacity-10"
        >
          🐟
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-1/4 text-3xl opacity-10"
        >
          🦜
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-20 right-1/3 text-4xl opacity-10"
        >
          🐡
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-200 px-6 py-2 text-sm font-semibold">
              ⭐ TESTIMONIALS
            </Badge>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4"
          >
            What Our{" "}
            <span className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Customers
            </span>{" "}
            Say
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg"
          >
            Join thousands of happy pet enthusiasts who trust us for premium fish and exotic birds.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mt-8"
          >
            {[
              { value: `${reviewCount}+`, label: "Google Reviews", icon: "😊" },
              { value: rating.toFixed(1), label: "Google Rating", icon: "⭐" },
              { value: "9AM-11PM", label: "Open Daily", icon: "💯" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center justify-center gap-2">
                  <span>{stat.icon}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4 mb-8"
        >
          <motion.button
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center
                      text-slate-600 hover:text-sky-500 hover:border-sky-300 hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={() => swiperRef.current?.slideNext()}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center
                      text-slate-600 hover:text-sky-500 hover:border-sky-300 hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1.2}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            autoplay={{
              delay: 5000, // 5 seconds - consistent with all carousels
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="testimonials-swiper pb-14"
          >
            {reviews.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTestimonial(testimonial)}
                  className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 cursor-pointer
                            hover:shadow-2xl hover:border-sky-200 transition-all duration-300 h-full mx-2"
                >
                  {/* Quote icon */}
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="w-10 h-10 text-sky-200" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      <Verified className="w-3 h-3" />
                      Verified
                    </motion.div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-4">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-sky-50">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full 
                                    flex items-center justify-center border-2 border-white">
                        <Verified className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.location}</p>
                    </div>
                  </div>

                  {/* Product tag */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-sky-600 bg-sky-50 px-3 py-2 rounded-full w-fit">
                    <Fish className="w-3 h-3" />
                    {testimonial.product}
                  </div>

                  {/* Click hint */}
                  <div className="mt-4 text-center text-xs text-slate-400">
                    Click to read full review →
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 
                      text-white px-8 shadow-lg shadow-sky-500/25"
          >
            Read All Reviews
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Modal */}
      {selectedTestimonial && (
        <TestimonialModal
          testimonial={selectedTestimonial}
          isOpen={!!selectedTestimonial}
          onClose={() => setSelectedTestimonial(null)}
        />
      )}

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .testimonials-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #cbd5e1;
          opacity: 1;
          transition: all 0.3s ease;
        }
        .testimonials-swiper .swiper-pagination-bullet-active {
          background: #0ea5e9;
          width: 32px;
          border-radius: 5px;
        }
        .testimonials-swiper .swiper-slide {
          height: auto;
        }
        .testimonials-swiper .swiper-slide > div {
          min-height: 380px;
        }
      `}</style>
    </section>
  );
}
