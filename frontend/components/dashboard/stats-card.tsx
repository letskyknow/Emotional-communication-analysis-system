'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: 'cyan' | 'pink' | 'yellow' | 'green' | 'purple' | 'orange'
  period?: 'hour' | 'day' | 'week' | 'month'
}

const colorMap = {
  cyan: 'text-cyber-neon-cyan border-cyber-neon-cyan/30 bg-cyber-neon-cyan/10',
  pink: 'text-cyber-neon-pink border-cyber-neon-pink/30 bg-cyber-neon-pink/10',
  yellow: 'text-cyber-neon-yellow border-cyber-neon-yellow/30 bg-cyber-neon-yellow/10',
  green: 'text-cyber-neon-green border-cyber-neon-green/30 bg-cyber-neon-green/10',
  purple: 'text-cyber-neon-purple border-cyber-neon-purple/30 bg-cyber-neon-purple/10',
  orange: 'text-cyber-neon-orange border-cyber-neon-orange/30 bg-cyber-neon-orange/10',
}

export function StatsCard({ title, value, change, trend, icon: Icon, color, period = 'hour' }: StatsCardProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div className={cn(
        'relative overflow-hidden rounded-lg border p-6 transition-all duration-300',
        colorMap[color],
        'group-hover:shadow-neon-' + color
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold font-orbitron mt-1">{value}</p>
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-sm font-medium',
                trend === 'up' ? 'text-cyber-neon-green' : 'text-cyber-neon-orange'
              )}>
                {change}
              </span>
              <span className="text-xs text-gray-500 ml-1">/ {period === 'hour' ? '小时' : period === 'day' ? '天' : period === 'week' ? '周' : '月'}</span>
            </div>
          </div>
          <Icon className={cn('h-12 w-12 opacity-50', colorMap[color].split(' ')[0])} />
        </div>
        
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
    </motion.div>
  )
}