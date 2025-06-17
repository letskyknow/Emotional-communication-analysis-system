'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  Bell,
  Shield,
  Database,
  Zap,
  Globe,
  Key,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      criticalOnly: false,
      dailyDigest: true,
      realTimeUpdates: true,
    },
    analysis: {
      autoAnalysis: true,
      analysisInterval: 30,
      emotionThreshold: 7,
      propagationThreshold: 1000,
    },
    api: {
      twitterRateLimit: 100,
      weiboRateLimit: 50,
      dataRetention: 90,
      cacheExpiry: 3600,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipWhitelist: '',
    },
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully',
      })
    }, 1500)
  }

  const handleReset = () => {
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to defaults',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron">System Settings</h1>
          <p className="text-gray-400 mt-1">Configure your emotion analysis system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            variant="cyber" 
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="cyber-card p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 mr-2 text-cyber-neon-cyan" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-alerts">Email Alerts</Label>
                <p className="text-sm text-gray-400">Receive alerts via email</p>
              </div>
              <Switch
                id="email-alerts"
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(checked) => 
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailAlerts: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="critical-only">Critical Alerts Only</Label>
                <p className="text-sm text-gray-400">Only receive critical level alerts</p>
              </div>
              <Switch
                id="critical-only"
                checked={settings.notifications.criticalOnly}
                onCheckedChange={(checked) => 
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, criticalOnly: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-digest">Daily Digest</Label>
                <p className="text-sm text-gray-400">Receive daily summary reports</p>
              </div>
              <Switch
                id="daily-digest"
                checked={settings.notifications.dailyDigest}
                onCheckedChange={(checked) => 
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, dailyDigest: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="real-time">Real-time Updates</Label>
                <p className="text-sm text-gray-400">Enable WebSocket connections</p>
              </div>
              <Switch
                id="real-time"
                checked={settings.notifications.realTimeUpdates}
                onCheckedChange={(checked) => 
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, realTimeUpdates: checked }
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* Analysis Settings */}
        <Card className="cyber-card p-6">
          <div className="flex items-center mb-4">
            <Zap className="h-5 w-5 mr-2 text-cyber-neon-pink" />
            <h2 className="text-xl font-semibold">Analysis Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-analysis">Auto Analysis</Label>
                <p className="text-sm text-gray-400">Automatically analyze new data</p>
              </div>
              <Switch
                id="auto-analysis"
                checked={settings.analysis.autoAnalysis}
                onCheckedChange={(checked) => 
                  setSettings({
                    ...settings,
                    analysis: { ...settings.analysis, autoAnalysis: checked }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="analysis-interval">Analysis Interval (minutes)</Label>
              <Input
                id="analysis-interval"
                type="number"
                value={settings.analysis.analysisInterval}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    analysis: { ...settings.analysis, analysisInterval: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="emotion-threshold">Emotion Alert Threshold (1-10)</Label>
              <Input
                id="emotion-threshold"
                type="number"
                min="1"
                max="10"
                value={settings.analysis.emotionThreshold}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    analysis: { ...settings.analysis, emotionThreshold: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="propagation-threshold">Propagation Threshold (posts)</Label>
              <Input
                id="propagation-threshold"
                type="number"
                value={settings.analysis.propagationThreshold}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    analysis: { ...settings.analysis, propagationThreshold: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
          </div>
        </Card>

        {/* API Settings */}
        <Card className="cyber-card p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 mr-2 text-cyber-neon-yellow" />
            <h2 className="text-xl font-semibold">API & Data</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="twitter-rate">Twitter API Rate Limit (req/min)</Label>
              <Input
                id="twitter-rate"
                type="number"
                value={settings.api.twitterRateLimit}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    api: { ...settings.api, twitterRateLimit: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="weibo-rate">Weibo API Rate Limit (req/min)</Label>
              <Input
                id="weibo-rate"
                type="number"
                value={settings.api.weiboRateLimit}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    api: { ...settings.api, weiboRateLimit: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="data-retention">Data Retention (days)</Label>
              <Input
                id="data-retention"
                type="number"
                value={settings.api.dataRetention}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    api: { ...settings.api, dataRetention: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="cache-expiry">Cache Expiry (seconds)</Label>
              <Input
                id="cache-expiry"
                type="number"
                value={settings.api.cacheExpiry}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    api: { ...settings.api, cacheExpiry: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="cyber-card p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2 text-cyber-neon-green" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-400">Require 2FA for all users</p>
              </div>
              <Switch
                id="2fa"
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => 
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: checked }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="ip-whitelist">IP Whitelist (comma separated)</Label>
              <Input
                id="ip-whitelist"
                type="text"
                placeholder="192.168.1.1, 10.0.0.1"
                value={settings.security.ipWhitelist}
                onChange={(e) => 
                  setSettings({
                    ...settings,
                    security: { ...settings.security, ipWhitelist: e.target.value }
                  })
                }
                className="mt-2 bg-black/50 border-gray-700"
              />
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Regenerate API Keys
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* System Info */}
      <Card className="cyber-card p-6">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 mr-2 text-cyber-neon-cyan" />
          <h2 className="text-xl font-semibold">System Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Version</p>
            <p className="font-mono">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-400">Database Size</p>
            <p className="font-mono">2.47 GB</p>
          </div>
          <div>
            <p className="text-gray-400">Last Backup</p>
            <p className="font-mono">2024-01-15 10:30:00</p>
          </div>
          <div>
            <p className="text-gray-400">Active Sessions</p>
            <p className="font-mono">3</p>
          </div>
          <div>
            <p className="text-gray-400">API Calls Today</p>
            <p className="font-mono">8,432</p>
          </div>
          <div>
            <p className="text-gray-400">System Uptime</p>
            <p className="font-mono">15d 7h 32m</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-400 font-semibold">Maintenance Window</p>
            <p className="text-gray-400">Next scheduled maintenance: January 20, 2024 at 2:00 AM UTC</p>
          </div>
        </div>
      </Card>
    </div>
  )
}