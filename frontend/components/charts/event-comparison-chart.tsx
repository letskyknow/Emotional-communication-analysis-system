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
  RadialBarChart,
  RadialBar,
  Legend,
  PolarAngleAxis,
} from 'recharts'
import { api } from '@/lib/api'

interface EventData {
  eventId: string
  eventName: string
  positive: number
  negative: number
  neutral: number
  totalPosts: number
  emotions: {
    joy: number
    anger: number
    fear: number
    sadness: number
    surprise: number
  }
}

interface EventComparisonChartProps {
  eventIds?: string[]
  refreshInterval?: number
}

export function EventComparisonChart({ eventIds = [], refreshInterval = 120000 }: EventComparisonChartProps) {
  const [data, setData] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'sentiment' | 'emotions'>('sentiment')
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(eventIds)

  const fetchEvents = async () => {
    try {
      const response = await api.getEvents({ limit: 10 })
      setAllEvents(response.data || [])
      
      // If no eventIds provided, use first 5 events
      if (eventIds.length === 0 && response.data && response.data.length > 0) {
        setSelectedEventIds(response.data.slice(0, 5).map((e: any) => e.id))
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const fetchData = async () => {
    try {
      if (selectedEventIds.length === 0) return

      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      const response = await api.getEventComparison({
        eventIds: selectedEventIds,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      setData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch event comparison data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEventIds.length > 0) {
      fetchData()
      
      const interval = setInterval(fetchData, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [selectedEventIds, refreshInterval])

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-cyber-neon-cyan animate-pulse">Loading event comparison data...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-gray-400">No event comparison data available</div>
      </div>
    )
  }

  // Prepare data for sentiment comparison
  const sentimentData = data.map(event => ({
    name: event.eventName.length > 20 ? event.eventName.substring(0, 20) + '...' : event.eventName,
    positive: Math.round(event.positive * 100),
    negative: Math.round(event.negative * 100),
    neutral: Math.round(event.neutral * 100),
    total: event.totalPosts,
  }))

  // Prepare data for emotion comparison
  const emotionData = data.map(event => ({
    name: event.eventName.length > 20 ? event.eventName.substring(0, 20) + '...' : event.eventName,
    joy: Math.round(event.emotions.joy * 100),
    anger: Math.round(event.emotions.anger * 100),
    fear: Math.round(event.emotions.fear * 100),
    sadness: Math.round(event.emotions.sadness * 100),
    surprise: Math.round(event.emotions.surprise * 100),
  }))

  // Prepare data for radial chart
  const radialData = data.map((event, index) => ({
    name: event.eventName,
    positivity: Math.round(event.positive * 100),
    fill: ['#00ffff', '#ff0080', '#ffff00', '#00ff88', '#ff00ff'][index % 5],
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-cyber-neon-pink">Event Emotion Comparison</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('sentiment')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'sentiment'
                ? 'bg-cyber-neon-pink/20 text-cyber-neon-pink border border-cyber-neon-pink'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            Sentiment
          </button>
          <button
            onClick={() => setViewMode('emotions')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'emotions'
                ? 'bg-cyber-neon-pink/20 text-cyber-neon-pink border border-cyber-neon-pink'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            Emotions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'sentiment' ? (
                <BarChart data={sentimentData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    style={{ fontSize: '11px' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #ff0080',
                      borderRadius: '4px',
                    }}
                    labelStyle={{ color: '#ff0080' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'total') return [value, 'Total Posts']
                      return [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="positive" stackId="a" fill="#00ff88" />
                  <Bar dataKey="neutral" stackId="a" fill="#ffff00" />
                  <Bar dataKey="negative" stackId="a" fill="#ff4444" />
                  <Bar dataKey="total" fill="#00ffff" opacity={0.3} />
                </BarChart>
              ) : (
                <BarChart data={emotionData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    style={{ fontSize: '11px' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #ff0080',
                      borderRadius: '4px',
                    }}
                    labelStyle={{ color: '#ff0080' }}
                    formatter={(value: number, name: string) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="joy" fill="#00ffff" />
                  <Bar dataKey="anger" fill="#ff0080" />
                  <Bar dataKey="fear" fill="#ffff00" />
                  <Bar dataKey="sadness" fill="#0099ff" />
                  <Bar dataKey="surprise" fill="#00ff88" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                data={radialData} 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="90%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="positivity"
                  cornerRadius={10}
                  fill="#00ffff"
                  label={{
                    position: 'insideStart',
                    fill: '#fff',
                    fontSize: '11px',
                    formatter: (value: number) => `${value}%`
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #00ffff',
                    borderRadius: '4px',
                  }}
                  labelStyle={{ color: '#00ffff' }}
                  formatter={(value: number) => [`${value}%`, 'Positivity Score']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Most Positive</div>
          <div className="text-cyber-neon-green font-bold">
            {data.reduce((prev, curr) => prev.positive > curr.positive ? prev : curr).eventName}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Most Active</div>
          <div className="text-cyber-neon-cyan font-bold">
            {data.reduce((prev, curr) => prev.totalPosts > curr.totalPosts ? prev : curr).eventName}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Total Posts</div>
          <div className="text-cyber-neon-yellow font-bold">
            {data.reduce((sum, event) => sum + event.totalPosts, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Avg Sentiment</div>
          <div className="text-cyber-neon-pink font-bold">
            {(data.reduce((sum, event) => sum + event.positive, 0) / data.length * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}