'use client'

import { motion } from 'framer-motion'
import { Clock, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react'

interface Event {
  id: string
  time: string
  type: 'spike' | 'alert' | 'trend' | 'mention'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

const mockEvents: Event[] = [
  {
    id: '1',
    time: '2 mins ago',
    type: 'spike',
    title: 'Emotion Spike Detected',
    description: 'Joy sentiment increased by 45% for #AITechnology',
    severity: 'high',
  },
  {
    id: '2',
    time: '15 mins ago',
    type: 'alert',
    title: 'Anomaly Alert',
    description: 'Unusual pattern in fear sentiment for @elonmusk tweets',
    severity: 'medium',
  },
  {
    id: '3',
    time: '32 mins ago',
    type: 'trend',
    title: 'New Trending Topic',
    description: '#CryptoMarket showing rapid sentiment shifts',
    severity: 'low',
  },
  {
    id: '4',
    time: '1 hour ago',
    type: 'mention',
    title: 'High Volume Mentions',
    description: '@VitalikButerin mentioned 2.3K times in last hour',
    severity: 'medium',
  },
  {
    id: '5',
    time: '2 hours ago',
    type: 'spike',
    title: 'Negative Sentiment Wave',
    description: 'Anger emotion spreading rapidly in #TechDebate',
    severity: 'high',
  },
]

const iconMap = {
  spike: TrendingUp,
  alert: AlertCircle,
  trend: TrendingUp,
  mention: MessageSquare,
}

const severityColors = {
  low: 'border-cyber-neon-green/30 text-cyber-neon-green',
  medium: 'border-cyber-neon-yellow/30 text-cyber-neon-yellow',
  high: 'border-cyber-neon-pink/30 text-cyber-neon-pink',
}

export function EventTimeline() {
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {mockEvents.map((event, index) => {
        const Icon = iconMap[event.type]
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative pl-10 pb-3 ${index !== mockEvents.length - 1 ? 'border-l border-gray-700' : ''}`}
          >
            <div className={`absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${severityColors[event.severity]}`}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-75" />
            </div>
            
            <div className="flex items-start space-x-2">
              <Icon className={`h-4 w-4 mt-0.5 ${severityColors[event.severity].split(' ')[1]}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{event.title}</h4>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.time}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{event.description}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}