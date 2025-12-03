'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageTransitionLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const isFirstLoad = useRef(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const rainbowColors = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#0ABDE3', '#1DD1A1']
  const aquaColors = ['#00D2D3', '#01A3A4', '#0097A7', '#00838F']

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }

    setIsLoading(true)
    setProgress(0)

    const duration = 800
    const startTime = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress)
      } else {
        setTimeout(() => setIsLoading(false), 100)
      }
    }

    requestAnimationFrame(updateProgress)
  }, [pathname, searchParams])

  // Auto-play video when loading
  useEffect(() => {
    if (isLoading && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Video */}
          <div className="absolute inset-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.12 }}
            >
              <source src="/videos/rinbow-loader-bird.mp4" type="video/mp4" />
            </video>
            {/* White overlay for better text readability */}
            <div className="absolute inset-0 bg-white/70" />
          </div>

          {/* Top Progress bar with Flying Parrot */}
          <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-50 via-gray-100 to-amber-50 z-10">
            {/* Progress fill */}
            <motion.div
              className="h-full relative"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF6B6B, #FF9F43, #FECA57, #48DBFB, #0ABDE3, #1DD1A1)',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
              }}
            />
            
            {/* Flying Parrot sitting on progress bar */}
            <motion.div
              className="absolute top-0 z-20"
              style={{ 
                left: `calc(${Math.min(progress, 98)}% - 10px)`,
                transition: 'left 0.05s linear'
              }}
              initial={{ opacity: 0, y: -20, rotate: -30 }}
              animate={{ 
                opacity: 1, 
                y: -2,
                rotate: progress < 100 ? [-5, 5, -5] : 0
              }}
              transition={{ 
                opacity: { duration: 0.2 },
                y: { duration: 0.3, type: 'spring' },
                rotate: { duration: 0.4, repeat: Infinity }
              }}
            >
              <span className="text-lg drop-shadow-sm">🦜</span>
              {/* Sparkle trail */}
              {progress > 10 && progress < 100 && (
                <motion.span
                  className="absolute -left-2 top-1 text-[8px]"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.25, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Brand Name */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center">
              {['R', 'i', 'n', 'b', 'o', 'w'].map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-bold text-xl sm:text-2xl"
                  style={{ color: rainbowColors[i] }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {letter}
                </motion.span>
              ))}
              <span className="mx-0.5" />
              {['A', 'q', 'u', 'a'].map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-semibold text-xl sm:text-2xl tracking-wide"
                  style={{ color: aquaColors[i] }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.02 }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Bouncing icons */}
          <motion.div
            className="flex items-center gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {['🐠', '🐦', '🐟', '🦜', '🐡'].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-lg"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
