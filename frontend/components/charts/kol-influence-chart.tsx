'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import { api } from '@/lib/api'

interface KOLData {
  kolId: string
  kolName: string
  platform: string
  postCount: number
  avgSentiment: number
  positiveCount: number
  negativeCount: number
  avgConfidence: number
  influenceScore: number
}

interface KOLInfluenceChartProps {
  limit?: number
  refreshInterval?: number
}

export function KOLInfluenceChart({ limit = 10, refreshInterval = 120000 }: KOLInfluenceChartProps) {
  const [data, setData] = useState<KOLData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'bar' | 'radar'>('bar')

  const fetchData = async () => {
    try {
      // Get data for the last 30 days
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      const response = await api.getKOLInfluence({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit,
      })

      setData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch KOL influence data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(fetchData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [limit, refreshInterval])

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-cyber-neon-cyan animate-pulse">Loading KOL influence data...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-gray-400">No KOL influence data available</div>
      </div>
    )
  }

  // Prepare data for radar chart
  const radarData = data.slice(0, 6).map(kol => ({
    name: kol.kolName.split(' ')[0], // First name only for radar chart
    influence: kol.influenceScore,
    sentiment: kol.avgSentiment * 100,
    activity: Math.min(kol.postCount / 10, 100), // Normalize post count
    confidence: kol.avgConfidence * 100,
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-cyber-neon-cyan">KOL Influence Analysis</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'bar'
                ? 'bg-cyber-neon-cyan/20 text-cyber-neon-cyan border border-cyber-neon-cyan'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'radar'
                ? 'bg-cyber-neon-cyan/20 text-cyber-neon-cyan border border-cyber-neon-cyan'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            Radar Chart
          </button>
        </div>
      </div>

      {viewMode === 'bar' ? (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="kolName" 
                stroke="#666"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #00ffff',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#00ffff' }}
                formatter={(value: number, name: string) => {
                  if (name === 'influenceScore') return [`${value.toFixed(2)}`, 'Influence']
                  if (name === 'avgSentiment') return [`${(value * 100).toFixed(1)}%`, 'Sentiment']
                  if (name === 'postCount') return [value, 'Posts']
                  return [value, name]
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar 
                dataKey="influenceScore" 
                fill="#00ffff" 
                name="Influence Score"
              />
              <Bar 
                dataKey="postCount" 
                fill="#ff0080" 
                name="Post Count"
              />
              <Bar 
                dataKey="positiveCount" 
                fill="#00ff88" 
                name="Positive Posts"
              />
              <Bar 
                dataKey="negativeCount" 
                fill="#ff4444" 
                name="Negative Posts"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid 
                gridType="polygon" 
                stroke="#333"
              />
              <PolarAngleAxis 
                dataKey="name" 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                stroke="#666"
                style={{ fontSize: '10px' }}
              />
              <Radar 
                name="Influence" 
                dataKey="influence" 
                stroke="#00ffff" 
                fill="#00ffff" 
                fillOpacity={0.3}
              />
              <Radar 
                name="Sentiment" 
                dataKey="sentiment" 
                stroke="#ff0080" 
                fill="#ff0080" 
                fillOpacity={0.3}
              />
              <Radar 
                name="Activity" 
                dataKey="activity" 
                stroke="#00ff88" 
                fill="#00ff88" 
                fillOpacity={0.3}
              />
              <Radar 
                name="Confidence" 
                dataKey="confidence" 
                stroke="#ffff00" 
                fill="#ffff00" 
                fillOpacity={0.3}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #00ffff',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#00ffff' }}
                formatter={(value: number) => `${value.toFixed(1)}`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Top Influencer</div>
          <div className="text-cyber-neon-cyan font-bold">{data[0]?.kolName || 'N/A'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Avg Influence</div>
          <div className="text-cyber-neon-pink font-bold">
            {(data.reduce((sum, kol) => sum + kol.influenceScore, 0) / data.length).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Total Posts</div>
          <div className="text-cyber-neon-yellow font-bold">
            {data.reduce((sum, kol) => sum + kol.postCount, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Positive Rate</div>
          <div className="text-cyber-neon-green font-bold">
            {(
              (data.reduce((sum, kol) => sum + kol.positiveCount, 0) /
                data.reduce((sum, kol) => sum + kol.postCount, 0)) *
              100
            ).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}