'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KOL {
  id: string
  username: string
  avatar: string
  emotionScore: number
  followers: string
  change: number
  rank: number
}

const mockKOLs: KOL[] = [
  {
    id: '1',
    username: '@elonmusk',
    avatar: 'EM',
    emotionScore: 92.5,
    followers: '150M',
    change: 5.2,
    rank: 1,
  },
  {
    id: '2',
    username: '@VitalikButerin',
    avatar: 'VB',
    emotionScore: 87.3,
    followers: '5.2M',
    change: -2.1,
    rank: 2,
  },
  {
    id: '3',
    username: '@CathieDWood',
    avatar: 'CW',
    emotionScore: 84.7,
    followers: '1.5M',
    change: 0,
    rank: 3,
  },
  {
    id: '4',
    username: '@naval',
    avatar: 'NR',
    emotionScore: 82.1,
    followers: '2.3M',
    change: 3.4,
    rank: 4,
  },
  {
    id: '5',
    username: '@balajis',
    avatar: 'BS',
    emotionScore: 79.8,
    followers: '890K',
    change: -1.2,
    rank: 5,
  },
]

export function KOLRanking() {
  return (
    <div className="space-y-3">
      {mockKOLs.map((kol, index) => (
        <motion.div
          key={kol.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3 p-3 rounded-lg border border-cyber-neon-cyan/20 hover:border-cyber-neon-cyan/50 transition-all duration-300 group"
        >
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyber-neon-cyan to-cyber-neon-pink flex items-center justify-center font-bold text-sm">
              {kol.avatar}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate">{kol.username}</p>
              <span className="text-xs text-gray-400">{kol.followers}</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${kol.emotionScore}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink"
                />
              </div>
              <span className="ml-2 text-xs font-mono text-cyber-neon-cyan">
                {kol.emotionScore.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {kol.change > 0 ? (
              <TrendingUp className="h-4 w-4 text-cyber-neon-green" />
            ) : kol.change < 0 ? (
              <TrendingDown className="h-4 w-4 text-cyber-neon-orange" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}