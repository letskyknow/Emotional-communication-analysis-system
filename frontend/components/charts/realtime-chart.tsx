'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { api } from '@/lib/api'

interface DataPoint {
  time: string
  joy: number
  anger: number
  fear: number
  sadness: number
  surprise: number
  overall: number
}

interface RealtimeChartProps {
  eventId?: string
  kolId?: string
  refreshInterval?: number
}

export function RealtimeChart({ eventId, kolId, refreshInterval = 30000 }: RealtimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      // Get data for the last 24 hours with hourly granularity
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)

      const response = await api.getEmotionTrends({
        granularity: 'hour',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        eventId,
        kolId,
      })

      const formattedData = response.map((item: any) => ({
        time: new Date(item.time).toLocaleTimeString('en-US', { 
          hour: '2-digit',
          minute: '2-digit' 
        }),
        joy: Math.round(item.joy * 100),
        anger: Math.round(item.anger * 100),
        fear: Math.round(item.fear * 100),
        sadness: Math.round(item.sadness * 100),
        surprise: Math.round(item.surprise * 100),
        overall: Math.round(item.overall * 100),
      }))

      setData(formattedData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch emotion trends:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up periodic refresh
    const interval = setInterval(fetchData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [eventId, kolId, refreshInterval])

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-cyber-neon-cyan animate-pulse">Loading emotion data...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-gray-400">No emotion data available</div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #00ffff',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#00ffff' }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="joy" 
            stroke="#00ffff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="anger" 
            stroke="#ff0080"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="fear" 
            stroke="#ffff00"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="sadness" 
            stroke="#0099ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="surprise" 
            stroke="#00ff88"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="overall" 
            stroke="#ff00ff"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}