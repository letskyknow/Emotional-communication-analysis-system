'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Globe,
  Search,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  AlertCircle,
  Clock,
  Filter,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  eventKols?: { kol: { id: string; username: string } }[]
  totalPosts: number
  emotionScore: number
  emotionTrend: 'positive' | 'negative' | 'neutral'
  alertLevel: 'low' | 'medium' | 'high'
  type?: string
  keywords?: string[]
  hashtags?: string[]
}

interface KOL {
  id: string
  username: string
  followersCount: number
  emotionScore: number
}

export default function EventsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [kols, setKOLs] = useState<KOL[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    type: 'monitoring',
    startDate: '',
    endDate: '',
    kolIds: [] as string[],
    keywords: [] as string[],
    hashtags: [] as string[],
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchKOLs()
    fetchStats()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.getEvents({
        page: 1,
        limit: 20,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      })
      setEvents(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchKOLs = async () => {
    try {
      const response = await api.getKOLs({ limit: 100 })
      setKOLs(response.data)
    } catch (error) {
      console.error('Failed to fetch KOLs:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const stats = await api.getEventStats()
      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents()
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, filterStatus])

  const handleAddEvent = async () => {
    if (!newEvent.name || !newEvent.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const event = await api.createEvent(newEvent)
      
      setShowAddModal(false)
      setNewEvent({
        name: '',
        description: '',
        type: 'monitoring',
        startDate: '',
        endDate: '',
        kolIds: [],
        keywords: [],
        hashtags: [],
      })
      setKeywordInput('')
      setHashtagInput('')
      
      toast({
        title: 'Event Created',
        description: `${event.name} has been added successfully`,
      })
      
      fetchEvents()
      fetchStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      })
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setNewEvent({
        ...newEvent,
        keywords: [...newEvent.keywords, keywordInput.trim()],
      })
      setKeywordInput('')
    }
  }

  const removeKeyword = (index: number) => {
    setNewEvent({
      ...newEvent,
      keywords: newEvent.keywords.filter((_, i) => i !== index),
    })
  }

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const hashtag = hashtagInput.trim().replace(/^#/, '')
      setNewEvent({
        ...newEvent,
        hashtags: [...newEvent.hashtags, hashtag],
      })
      setHashtagInput('')
    }
  }

  const removeHashtag = (index: number) => {
    setNewEvent({
      ...newEvent,
      hashtags: newEvent.hashtags.filter((_, i) => i !== index),
    })
  }

  const getKolCount = (event: Event) => {
    return event.eventKols?.length || 0
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron">Event Monitoring</h1>
          <p className="text-gray-400 mt-1">Track and analyze emotion trends for events</p>
        </div>
        <Button
          variant="cyber"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
            <Globe className="h-8 w-8 text-cyber-neon-cyan" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Now</p>
              <p className="text-2xl font-bold">{stats?.active || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-cyber-neon-green" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">High Alerts</p>
              <p className="text-2xl font-bold">{stats?.highAlerts || 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold">
                {stats?.totalPosts ? (stats.totalPosts / 1000).toFixed(1) + 'K' : '0'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-cyber-neon-pink" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/50 border-gray-700 focus:border-cyber-neon-cyan"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="cyber-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    <Badge className={`border ${getAlertColor(event.alertLevel)}`}>
                      {event.alertLevel} alert
                    </Badge>
                  </div>
                  <p className="text-gray-400 mb-4">{event.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">KOLs</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{getKolCount(event)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Posts</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <Activity className="h-3 w-3" />
                        <span>{event.totalPosts.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Emotion Score</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <span className={`font-mono ${
                          event.emotionTrend === 'positive' ? 'text-cyber-neon-green' :
                          event.emotionTrend === 'negative' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {event.emotionScore.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trend</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <TrendingUp className={`h-3 w-3 ${
                          event.emotionTrend === 'positive' ? 'text-cyber-neon-green' :
                          event.emotionTrend === 'negative' ? 'text-red-400' :
                          'text-gray-400'
                        }`} />
                        <span>{event.emotionTrend}</span>
                      </div>
                    </div>
                  </div>

                  {event.status === 'active' && (
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink"
                        initial={{ width: '0%' }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-4"
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="cyber-card p-6">
              <h2 className="text-xl font-bold mb-4">Create New Event</h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Event Name *</label>
                  <Input
                    placeholder="Enter event name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Description</label>
                  <textarea
                    placeholder="Event description..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md"
                  >
                    <option value="monitoring">Monitoring</option>
                    <option value="campaign">Campaign</option>
                    <option value="crisis">Crisis</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Start Date *</label>
                    <Input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      className="bg-black/50 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      className="bg-black/50 border-gray-700"
                    />
                  </div>
                </div>
                
                {/* KOL Selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Select KOLs</label>
                  <div className="space-y-2">
                    <select
                      className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md"
                      onChange={(e) => {
                        if (e.target.value && !newEvent.kolIds.includes(e.target.value)) {
                          setNewEvent({
                            ...newEvent,
                            kolIds: [...newEvent.kolIds, e.target.value],
                          })
                        }
                      }}
                    >
                      <option value="">Select a KOL...</option>
                      {kols.map((kol) => (
                        <option key={kol.id} value={kol.id}>
                          @{kol.username} ({(kol.followersCount / 1000).toFixed(1)}K followers)
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {newEvent.kolIds.map((kolId, index) => {
                        const kol = kols.find(k => k.id === kolId)
                        return kol ? (
                          <Badge
                            key={index}
                            className="bg-cyber-bg-secondary border-gray-700 cursor-pointer"
                            onClick={() => setNewEvent({
                              ...newEvent,
                              kolIds: newEvent.kolIds.filter(id => id !== kolId),
                            })}
                          >
                            @{kol.username} ×
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Keywords</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                        className="bg-black/50 border-gray-700"
                      />
                      <Button type="button" onClick={addKeyword} variant="ghost">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newEvent.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          className="bg-cyber-bg-secondary border-gray-700 cursor-pointer"
                          onClick={() => removeKeyword(index)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Hashtags</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add hashtag..."
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addHashtag()
                          }
                        }}
                        className="bg-black/50 border-gray-700"
                      />
                      <Button type="button" onClick={addHashtag} variant="ghost">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newEvent.hashtags.map((hashtag, index) => (
                        <Badge
                          key={index}
                          className="bg-cyber-bg-secondary border-gray-700 cursor-pointer"
                          onClick={() => removeHashtag(index)}
                        >
                          #{hashtag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="cyber"
                  onClick={handleAddEvent}
                  className="flex-1"
                >
                  Create Event
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}