'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Filter,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface Alert {
  id: string
  type: 'emotion_spike' | 'kol_activity' | 'event_threshold' | 'system'
  level: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'resolved'
  kol?: string
  event?: string
  metrics?: {
    before: number
    after: number
    change: number
  }
}

export default function AlertsPage() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock alerts data
    setAlerts([
      {
        id: '1',
        type: 'emotion_spike',
        level: 'critical',
        title: 'Critical Emotion Spike Detected',
        description: 'Negative emotion increased by 45% in the last hour for AI Conference event',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'active',
        event: 'AI Conference 2024',
        metrics: { before: 5.2, after: 2.8, change: -45 },
      },
      {
        id: '2',
        type: 'kol_activity',
        level: 'high',
        title: 'Unusual KOL Activity',
        description: 'Tech Influencer posting frequency increased by 300%',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'acknowledged',
        kol: 'Tech Influencer',
        metrics: { before: 5, after: 20, change: 300 },
      },
      {
        id: '3',
        type: 'event_threshold',
        level: 'medium',
        title: 'Event Threshold Reached',
        description: 'Crypto Market Crash event reached 10K posts threshold',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'resolved',
        event: 'Crypto Market Crash',
      },
      {
        id: '4',
        type: 'system',
        level: 'low',
        title: 'Data Collection Delay',
        description: 'Twitter API rate limit approaching, collection may slow down',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        status: 'active',
      },
    ])
  }, [])

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged' } : alert
    ))
    toast({
      title: 'Alert Acknowledged',
      description: 'The alert has been marked as acknowledged',
    })
  }

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' } : alert
    ))
    toast({
      title: 'Alert Resolved',
      description: 'The alert has been marked as resolved',
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emotion_spike': return <TrendingUp className="h-5 w-5" />
      case 'kol_activity': return <Bell className="h-5 w-5" />
      case 'event_threshold': return <AlertCircle className="h-5 w-5" />
      case 'system': return <AlertTriangle className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesLevel = filterLevel === 'all' || alert.level === filterLevel
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesLevel && matchesStatus && matchesSearch
  })

  const activeAlerts = alerts.filter(a => a.status === 'active').length
  const criticalAlerts = alerts.filter(a => a.level === 'critical' && a.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron">Alert Center</h1>
          <p className="text-gray-400 mt-1">Monitor and manage system alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon">
            <BellOff className="h-4 w-4" />
          </Button>
          <Button variant="cyber">
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold">{activeAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Critical</p>
              <p className="text-2xl font-bold">{criticalAlerts}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Acknowledged</p>
              <p className="text-2xl font-bold">{alerts.filter(a => a.status === 'acknowledged').length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold">{alerts.filter(a => a.status === 'resolved').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/50 border-gray-700 focus:border-cyber-neon-cyan"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-sm"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className="px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className={`cyber-card p-6 ${alert.status === 'active' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-full ${getLevelColor(alert.level)}`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    <h3 className="text-lg font-semibold">{alert.title}</h3>
                    <Badge className={`${getLevelColor(alert.level)} border`}>
                      {alert.level}
                    </Badge>
                    <Badge variant={
                      alert.status === 'active' ? 'destructive' :
                      alert.status === 'acknowledged' ? 'secondary' :
                      'default'
                    }>
                      {alert.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 mb-3">{alert.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    {alert.kol && (
                      <div className="flex items-center space-x-1">
                        <Bell className="h-3 w-3" />
                        <span>KOL: {alert.kol}</span>
                      </div>
                    )}
                    {alert.event && (
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Event: {alert.event}</span>
                      </div>
                    )}
                  </div>

                  {alert.metrics && (
                    <div className="mt-3 p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Change:</span>
                        <span className={`font-mono font-bold ${
                          alert.metrics.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {alert.metrics.change > 0 ? '+' : ''}{alert.metrics.change}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {alert.status === 'active' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="text-green-400 hover:text-green-300"
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="cyber-card p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No alerts found matching your criteria</p>
        </Card>
      )}
    </div>
  )
}