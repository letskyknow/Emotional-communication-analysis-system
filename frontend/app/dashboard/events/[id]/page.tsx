'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  Hash,
  Key,
  RefreshCw,
  Loader2,
  MessageSquare,
  Heart,
  Share2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { RealtimeChart } from '@/components/charts/realtime-chart'
import { EmotionHeatmap } from '@/components/charts/emotion-heatmap'

interface EventDetail {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  emotionScore: number
  emotionTrend: string
  alertLevel: string
  totalPosts: number
  type: string
  keywords: string[]
  hashtags: string[]
  eventKols: { kol: { id: string; username: string; avatar?: string } }[]
  emotionData: any[]
}

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const data = await api.getEvent(id as string)
      setEvent(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch event details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEventDetails()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-cyber-neon-green'
      case 'upcoming': return 'text-cyber-neon-yellow'
      case 'completed': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-neon-cyan" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Event not found</p>
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/events')}
          className="mt-4"
        >
          Back to Events
        </Button>
      </div>
    )
  }

  // Generate sample tweet data for visualization
  const sampleTweets = event.emotionData?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/events')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-orbitron">{event.name}</h1>
            <p className="text-gray-400 mt-1">{event.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
          <Badge className={`border ${getAlertColor(event.alertLevel)}`}>
            {event.alertLevel} alert
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-xl font-bold">
                {new Date(event.startDate).toLocaleDateString()} -
                {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'Ongoing'}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-cyber-neon-cyan" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Monitored KOLs</p>
              <p className="text-2xl font-bold">{event.eventKols?.length || 0}</p>
            </div>
            <Users className="h-8 w-8 text-cyber-neon-pink" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold">{event.totalPosts.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-cyber-neon-green" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Emotion Score</p>
              <p className={`text-2xl font-bold ${
                event.emotionTrend === 'positive' ? 'text-cyber-neon-green' :
                event.emotionTrend === 'negative' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {event.emotionScore.toFixed(1)}/10
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-cyber-neon-yellow" />
          </div>
        </Card>
      </div>

      {/* Monitoring Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keywords & Hashtags */}
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4">Monitoring Terms</h3>
          
          {event.keywords && event.keywords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center">
                <Key className="h-3 w-3 mr-1" /> Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {event.keywords.map((keyword, index) => (
                  <Badge key={index} className="bg-cyber-bg-secondary border-gray-700">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {event.hashtags && event.hashtags.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2 flex items-center">
                <Hash className="h-3 w-3 mr-1" /> Hashtags
              </p>
              <div className="flex flex-wrap gap-2">
                {event.hashtags.map((hashtag, index) => (
                  <Badge key={index} className="bg-cyber-bg-secondary border-gray-700">
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Associated KOLs */}
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4">Associated KOLs</h3>
          <div className="space-y-3">
            {event.eventKols?.map((eventKol, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-neon-cyan to-cyber-neon-pink" />
                  <span className="font-medium">@{eventKol.kol.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/kol/${eventKol.kol.id}`)}
                >
                  View Profile
                </Button>
              </div>
            ))}
            {(!event.eventKols || event.eventKols.length === 0) && (
              <p className="text-gray-400 text-center py-4">No KOLs associated</p>
            )}
          </div>
        </Card>
      </div>

      {/* Emotion Analysis Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4">Emotion Trend</h3>
          <RealtimeChart />
        </Card>
        <Card className="cyber-card p-6">
          <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
          <EmotionHeatmap />
        </Card>
      </div>

      {/* Recent Posts */}
      <Card className="cyber-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {sampleTweets.map((tweet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-black/30 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-neon-cyan to-cyber-neon-pink" />
                  <span className="font-medium text-sm">@user_{index + 1}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(tweet.analyzedAt || Date.now()).toLocaleString()}
                  </span>
                </div>
                <Badge className={
                  tweet.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                  tweet.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }>
                  {tweet.sentiment}
                </Badge>
              </div>
              <p className="text-sm text-gray-300 mb-3">{tweet.text || 'Sample tweet content...'}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{Math.floor(Math.random() * 1000)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{Math.floor(Math.random() * 100)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Share2 className="h-3 w-3" />
                  <span>{Math.floor(Math.random() * 500)}</span>
                </span>
              </div>
            </motion.div>
          ))}
          {sampleTweets.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              No posts collected yet. Posts will appear here once monitoring begins.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}