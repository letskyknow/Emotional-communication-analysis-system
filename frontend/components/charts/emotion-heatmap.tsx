'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface HeatmapData {
  hour: number
  emotion: string
  value: number
  count: number
}

interface EmotionHeatmapProps {
  eventId?: string
  kolId?: string
  refreshInterval?: number
}

export function EmotionHeatmap({ eventId, kolId, refreshInterval = 60000 }: EmotionHeatmapProps) {
  const [data, setData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)

  const fetchData = async () => {
    try {
      // Get data for the last 7 days
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

      const response = await api.getEmotionHeatmap({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        eventId,
        kolId,
      })

      setData(response.data)
      setSummary(response.summary)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(fetchData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [eventId, kolId, refreshInterval])

  const getColor = (value: number) => {
    // Color scale from dark (low) to bright cyan (high)
    if (value === 0) return '#0a0a0a'
    if (value < 20) return '#0a2a2a'
    if (value < 40) return '#0a4a4a'
    if (value < 60) return '#0a6a6a'
    if (value < 80) return '#0a8a8a'
    return '#00ffff'
  }

  if (loading) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center">
        <div className="text-cyber-neon-cyan animate-pulse">加载中...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center">
        <div className="text-gray-400">暂无数据</div>
      </div>
    )
  }

  const emotions = [
    { key: 'positive', label: '积极' },
    { key: 'negative', label: '消极' },
    { key: 'neutral', label: '中性' }
  ]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Y-axis labels */}
          <div className="flex">
            <div className="w-20"></div>
            <div className="flex-1 flex justify-between px-1">
              {hours.map((hour) => (
                <div key={hour} className="text-xs text-gray-500 w-6 text-center">
                  {hour % 3 === 0 ? `${hour}:00` : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap rows */}
          {emotions.map((emotion) => (
            <div key={emotion.key} className="flex items-center mb-1">
              <div className="w-20 text-sm text-gray-400 pr-2 text-right">{emotion.label}</div>
              <div className="flex-1 flex gap-[2px]">
                {hours.map((hour) => {
                  const cell = data.find(
                    (d) => d.hour === hour && d.emotion === emotion.key.charAt(0).toUpperCase() + emotion.key.slice(1)
                  )
                  const value = cell?.value || 0
                  const count = cell?.count || 0
                  
                  return (
                    <div
                      key={`${emotion.key}-${hour}`}
                      className="relative group flex-1 h-8 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10"
                      style={{ backgroundColor: getColor(value) }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-cyber-neon-cyan rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                        <div className="text-cyber-neon-cyan">{emotion.label} {hour}:00</div>
                        <div className="text-white">得分: {value.toFixed(1)}%</div>
                        <div className="text-gray-400">{count} 条帖子</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Color scale legend */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <span className="text-xs text-gray-400">低</span>
            <div className="flex space-x-1">
              {[0, 20, 40, 60, 80, 100].map((val) => (
                <div
                  key={val}
                  className="w-8 h-4 rounded-sm"
                  style={{ backgroundColor: getColor(val) }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">高</span>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">总分析数</div>
            <div className="text-cyber-neon-cyan font-bold">{summary.totalAnalyzed}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">高峰时段</div>
            <div className="text-cyber-neon-pink font-bold">{summary.peakHour}:00</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">主导情绪</div>
            <div className="text-cyber-neon-yellow font-bold capitalize">{summary.dominantSentiment}</div>
          </div>
        </div>
      )}
    </div>
  )
}