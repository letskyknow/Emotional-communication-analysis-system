'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  Globe,
  BarChart3,
  Brain,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { RealtimeChart } from '@/components/charts/realtime-chart'
import { EmotionHeatmap } from '@/components/charts/emotion-heatmap'
import { KOLInfluenceChart } from '@/components/charts/kol-influence-chart'
import { EventComparisonChart } from '@/components/charts/event-comparison-chart'
import { KOLRanking } from '@/components/dashboard/kol-ranking'
import { EventTimeline } from '@/components/dashboard/event-timeline'
import { StatsCard } from '@/components/dashboard/stats-card'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [eventStats, setEventStats] = useState<any>(null)
  const [kolCount, setKolCount] = useState(0)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsRefreshing(true)
      // Fetch event statistics
      const stats = await api.getEventStats()
      setEventStats(stats)

      // Fetch KOL count
      const kolsResponse = await api.getKOLs({ limit: 1 })
      setKolCount(kolsResponse.total || 0)
      
      setIsRefreshing(false)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchStats()
  }

  const getDateRange = () => {
    const endDate = new Date()
    let startDate = new Date()
    
    switch (selectedTimeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
    }
    
    return { startDate, endDate }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold font-orbitron">
          <span className="glitch" data-text="系统控制台">
            系统控制台
          </span>
        </h1>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as '24h' | '7d' | '30d')}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-gray-300 focus:border-cyber-neon-cyan focus:outline-none"
            >
              <option value="24h">过去24小时</option>
              <option value="7d">过去7天</option>
              <option value="30d">过去30天</option>
            </select>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded bg-gray-800 border border-gray-700 hover:border-cyber-neon-cyan transition-colors group"
            disabled={isRefreshing}
          >
            <RefreshCw 
              className={`h-4 w-4 text-gray-400 group-hover:text-cyber-neon-cyan ${
                isRefreshing ? 'animate-spin' : ''
              }`} 
            />
          </button>
          
          {/* Last Update Time */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">最后更新：</span>
            <span className="text-sm text-cyber-neon-cyan font-mono animate-pulse">
              {new Date().toLocaleTimeString('zh-CN')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="活跃KOLs"
          value={kolCount.toString()}
          change="+3"
          trend="up"
          icon={Users}
          color="cyan"
        />
        <StatsCard
          title="追踪事件"
          value={eventStats?.total?.toString() || '0'}
          change={`+${eventStats?.active || 0}`}
          trend="up"
          icon={Globe}
          color="pink"
        />
        <StatsCard
          title="总帖子数"
          value={eventStats?.totalPosts ? Math.floor(eventStats.totalPosts).toString() : '0'}
          change="+15"
          trend="up"
          icon={Activity}
          color="yellow"
        />
        <StatsCard
          title="高级预警"
          value={eventStats?.highAlerts?.toString() || '0'}
          change="-2"
          trend={eventStats?.highAlerts > 0 ? 'up' : 'down'}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Emotion Chart - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="neon-card">
            <div className="neon-card-inner">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-cyber-neon-cyan" />
                  实时情绪流
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-cyber-neon-green rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">实时</span>
                </div>
              </div>
              <RealtimeChart refreshInterval={30000} />
            </div>
          </div>
        </motion.div>

        {/* KOL Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="neon-card h-full">
            <div className="neon-card-inner">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-cyber-neon-pink" />
                顶级影响者
              </h2>
              <KOLRanking />
            </div>
          </div>
        </motion.div>

        {/* Emotion Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="neon-card">
            <div className="neon-card-inner">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-cyber-neon-yellow" />
                情绪分布热力图
              </h2>
              <EmotionHeatmap refreshInterval={60000} />
            </div>
          </div>
        </motion.div>

        {/* Event Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="neon-card h-full">
            <div className="neon-card-inner">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-cyber-neon-orange" />
                事件时间线
              </h2>
              <EventTimeline />
            </div>
          </div>
        </motion.div>

        {/* KOL Influence Chart - Takes full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3"
        >
          <div className="neon-card">
            <div className="neon-card-inner">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-cyber-neon-cyan" />
                KOL影响力分布
              </h2>
              <KOLInfluenceChart limit={10} refreshInterval={120000} />
            </div>
          </div>
        </motion.div>

        {/* Event Comparison Chart - Takes full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3"
        >
          <div className="neon-card">
            <div className="neon-card-inner">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Globe className="mr-2 h-5 w-5 text-cyber-neon-pink" />
                事件情绪对比
              </h2>
              <EventComparisonChart refreshInterval={120000} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="relative overflow-hidden rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/10 p-4"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-cyber-neon-orange animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium">系统状态：所有服务正常运行</p>
            <p className="text-xs text-gray-400">
              实时情绪分析正在顺利运行。正在监控 {kolCount} 个 KOL 和 {eventStats?.total || 0} 个事件。
            </p>
          </div>
          <button className="text-sm text-cyber-neon-orange hover:text-white transition-colors">
            查看详情
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-neon-orange/20 to-transparent animate-scan" />
      </motion.div>
    </div>
  )
}