'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// Fade in animation
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale in animation
export function ScaleIn({ 
  children, 
  delay = 0,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger container
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger item
export function StaggerItem({ 
  children,
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Hover card effect
export function HoverCard({ 
  children,
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        boxShadow: '0 20px 40px -15px rgba(217, 119, 6, 0.15)' 
      }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Pulse animation for icons
export function PulseIcon({ 
  children,
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Gradient background animation
export function AnimatedGradient({ 
  className = '' 
}: { 
  className?: string
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute -inset-[100%] opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 113, 108, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(217, 119, 6, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(120, 113, 108, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 113, 108, 0.1) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// Floating particles
export function FloatingParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-500/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
          }}
          animate={{
            y: ['100vh', '-10vh'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
