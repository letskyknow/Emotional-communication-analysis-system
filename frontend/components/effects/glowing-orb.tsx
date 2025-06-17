'use client'

import { motion } from 'framer-motion'

export function GlowingOrb() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['-50%', '150%'],
          y: ['20%', '80%', '20%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['150%', '-50%'],
          y: ['80%', '20%', '80%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}