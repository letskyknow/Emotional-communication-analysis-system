'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Users,
  Globe,
  Zap,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

const emotionTrendData = [
  { date: 'Mon', positive: 65, negative: 20, neutral: 15 },
  { date: 'Tue', positive: 70, negative: 18, neutral: 12 },
  { date: 'Wed', positive: 55, negative: 30, neutral: 15 },
  { date: 'Thu', positive: 48, negative: 35, neutral: 17 },
  { date: 'Fri', positive: 52, negative: 28, neutral: 20 },
  { date: 'Sat', positive: 68, negative: 22, neutral: 10 },
  { date: 'Sun', positive: 72, negative: 18, neutral: 10 },
]

const kolPerformanceData = [
  { name: 'Tech Influencer', influence: 8.5, engagement: 7.2, reach: 9.1 },
  { name: 'Crypto Expert', influence: 7.8, engagement: 8.5, reach: 7.0 },
  { name: 'AI Researcher', influence: 9.2, engagement: 6.8, reach: 8.3 },
  { name: 'Market Analyst', influence: 7.5, engagement: 8.0, reach: 7.8 },
  { name: 'Tech Journalist', influence: 8.0, engagement: 7.5, reach: 8.5 },
]

const platformDistribution = [
  { name: 'Twitter', value: 45, color: '#00E5FF' },
  { name: 'Weibo', value: 30, color: '#FF1744' },
  { name: 'Reddit', value: 15, color: '#FFEB3B' },
  { name: 'Others', value: 10, color: '#E040FB' },
]

const alertDistribution = [
  { category: 'Market', critical: 12, high: 25, medium: 40, low: 60 },
  { category: 'Tech', critical: 8, high: 18, medium: 35, low: 55 },
  { category: 'Social', critical: 15, high: 30, medium: 45, low: 48 },
  { category: 'Political', critical: 20, high: 35, medium: 38, low: 42 },
  { category: 'Health', critical: 5, high: 15, medium: 30, low: 65 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Comprehensive emotion propagation analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="cyber" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-6 w-6 text-cyber-neon-cyan" />
            <span className="text-xs text-green-400">+12.5%</span>
          </div>
          <p className="text-sm text-gray-400">Total Posts Analyzed</p>
          <p className="text-2xl font-bold font-mono">247.3K</p>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-6 w-6 text-cyber-neon-pink" />
            <span className="text-xs text-green-400">+8.2%</span>
          </div>
          <p className="text-sm text-gray-400">Active KOLs</p>
          <p className="text-2xl font-bold font-mono">42</p>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-6 w-6 text-cyber-neon-yellow" />
            <span className="text-xs text-red-400">-3.1%</span>
          </div>
          <p className="text-sm text-gray-400">Avg Emotion Score</p>
          <p className="text-2xl font-bold font-mono">6.8/10</p>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-6 w-6 text-cyber-neon-green" />
            <span className="text-xs text-green-400">+15.7%</span>
          </div>
          <p className="text-sm text-gray-400">Propagation Speed</p>
          <p className="text-2xl font-bold font-mono">2.3K/h</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Trend */}
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-cyber-neon-cyan" />
            Emotion Trend Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={emotionTrendData}>
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1744" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF1744" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="#00E5FF"
                fillOpacity={1}
                fill="url(#positiveGradient)"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stroke="#FF1744"
                fillOpacity={1}
                fill="url(#negativeGradient)"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* KOL Performance Radar */}
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-cyber-neon-pink" />
            KOL Performance Matrix
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={kolPerformanceData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="name" stroke="#666" />
              <PolarRadiusAxis stroke="#666" />
              <Radar
                name="Influence"
                dataKey="influence"
                stroke="#00E5FF"
                fill="#00E5FF"
                fillOpacity={0.6}
              />
              <Radar
                name="Engagement"
                dataKey="engagement"
                stroke="#E040FB"
                fill="#E040FB"
                fillOpacity={0.6}
              />
              <Radar
                name="Reach"
                dataKey="reach"
                stroke="#FFEB3B"
                fill="#FFEB3B"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Platform Distribution */}
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-cyber-neon-yellow" />
            Platform Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {platformDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Alert Distribution */}
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-cyber-neon-green" />
            Alert Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="category" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="critical" stackId="a" fill="#FF1744" />
              <Bar dataKey="high" stackId="a" fill="#FF9800" />
              <Bar dataKey="medium" stackId="a" fill="#FFEB3B" />
              <Bar dataKey="low" stackId="a" fill="#4CAF50" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card className="cyber-card p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm text-gray-400">Metric</th>
                <th className="text-right py-3 px-4 text-sm text-gray-400">Current</th>
                <th className="text-right py-3 px-4 text-sm text-gray-400">Previous</th>
                <th className="text-right py-3 px-4 text-sm text-gray-400">Change</th>
                <th className="text-right py-3 px-4 text-sm text-gray-400">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="py-3 px-4">Emotion Propagation Score</td>
                <td className="text-right py-3 px-4 font-mono">8.42</td>
                <td className="text-right py-3 px-4 font-mono text-gray-400">7.89</td>
                <td className="text-right py-3 px-4 text-green-400">+6.7%</td>
                <td className="text-right py-3 px-4">
                  <TrendingUp className="h-4 w-4 text-green-400 inline" />
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="py-3 px-4">Average Response Time</td>
                <td className="text-right py-3 px-4 font-mono">2.3h</td>
                <td className="text-right py-3 px-4 font-mono text-gray-400">3.1h</td>
                <td className="text-right py-3 px-4 text-green-400">-25.8%</td>
                <td className="text-right py-3 px-4">
                  <TrendingUp className="h-4 w-4 text-green-400 inline" />
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="py-3 px-4">Network Reach</td>
                <td className="text-right py-3 px-4 font-mono">4.2M</td>
                <td className="text-right py-3 px-4 font-mono text-gray-400">3.8M</td>
                <td className="text-right py-3 px-4 text-green-400">+10.5%</td>
                <td className="text-right py-3 px-4">
                  <TrendingUp className="h-4 w-4 text-green-400 inline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}