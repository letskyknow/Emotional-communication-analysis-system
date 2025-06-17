'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Search,
  Plus,
  Twitter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  Edit,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

interface KOL {
  id: string
  name: string
  platform: string
  handle: string
  followers: number
  influence_score: number
  emotion_trend: 'positive' | 'negative' | 'neutral'
  last_analyzed: string
  status: 'active' | 'inactive'
}

export default function KOLManagementPage() {
  const { toast } = useToast()
  const [kols, setKols] = useState<KOL[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKol, setNewKol] = useState({ name: '', handle: '', platform: 'twitter' })

  const fetchKOLs = async () => {
    try {
      const response = await api.getKOLs()
      setKols(response.data || [])
    } catch (error) {
      console.error('Failed to fetch KOLs:', error)
      // 如果API失败，使用模拟数据
      setKols([
        {
          id: '1',
          name: 'Tech Influencer',
          platform: 'twitter',
          handle: '@techinfluencer',
          followers: 125000,
          influence_score: 8.5,
          emotion_trend: 'positive',
          last_analyzed: '2024-01-15T10:30:00',
          status: 'active',
        },
        {
          id: '2',
          name: 'Crypto Expert',
          platform: 'twitter',
          handle: '@cryptoexpert',
          followers: 89000,
          influence_score: 7.2,
          emotion_trend: 'negative',
          last_analyzed: '2024-01-15T11:00:00',
          status: 'active',
        },
      ])
    }
  }

  useEffect(() => {
    fetchKOLs()
  }, [])

  const handleAddKol = async () => {
    if (!newKol.name || !newKol.handle) {
      toast({
        title: '错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      })
      return
    }

    try {
      // 调用真实的API
      const response = await api.createKOL({
        username: newKol.handle.startsWith('@') ? newKol.handle.substring(1) : newKol.handle,
        category: newKol.platform,
      })

      // 重新获取KOL列表
      await fetchKOLs()
      
      setShowAddModal(false)
      setNewKol({ name: '', handle: '', platform: 'twitter' })
      
      toast({
        title: '添加成功',
        description: `${newKol.name} 已成功添加`,
      })
    } catch (error) {
      toast({
        title: '添加失败',
        description: '无法添加KOL，请稍后重试',
        variant: 'destructive',
      })
      console.error('Failed to add KOL:', error)
    }
  }

  const handleDeleteKol = (id: string) => {
    setKols(kols.filter(kol => kol.id !== id))
    toast({
      title: '删除成功',
      description: 'KOL 已从跟踪列表中移除',
    })
  }

  const filteredKols = kols.filter(kol =>
    kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kol.handle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron">KOL 管理</h1>
          <p className="text-gray-400 mt-1">跟踪和管理关键意见领袖</p>
        </div>
        <Button
          variant="cyber"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>添加 KOL</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">总 KOL 数</p>
              <p className="text-2xl font-bold">{kols.length}</p>
            </div>
            <Users className="h-8 w-8 text-cyber-neon-cyan" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">活跃</p>
              <p className="text-2xl font-bold">{kols.filter(k => k.status === 'active').length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-cyber-neon-green" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">总触达</p>
              <p className="text-2xl font-bold">
                {(kols.reduce((sum, k) => sum + k.followers, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <Star className="h-8 w-8 text-cyber-neon-yellow" />
          </div>
        </Card>
        <Card className="cyber-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">平均影响力</p>
              <p className="text-2xl font-bold">
                {kols.length > 0 ? (kols.reduce((sum, k) => sum + k.influence_score, 0) / kols.length).toFixed(1) : '0'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-cyber-neon-pink" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索 KOL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-black/50 border-gray-700 focus:border-cyber-neon-cyan"
        />
      </div>

      {/* KOL List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKols.map((kol) => (
          <motion.div
            key={kol.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="cyber-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyber-neon-cyan to-cyber-neon-pink flex items-center justify-center">
                    <Twitter className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{kol.name}</h3>
                    <p className="text-sm text-gray-400">{kol.handle}</p>
                  </div>
                </div>
                <Badge
                  variant={kol.status === 'active' ? 'default' : 'secondary'}
                  className={kol.status === 'active' ? 'bg-cyber-neon-green/20 text-cyber-neon-green' : ''}
                >
                  {kol.status === 'active' ? '活跃' : '未激活'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">关注者</span>
                  <span className="font-mono">{(kol.followers / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">影响力评分</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono">{kol.influence_score.toFixed(1)}</span>
                    {kol.emotion_trend === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-cyber-neon-green" />
                    ) : kol.emotion_trend === 'negative' ? (
                      <TrendingDown className="h-4 w-4 text-cyber-neon-red" />
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">最后分析</span>
                  <span className="text-xs">{new Date(kol.last_analyzed).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-800">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-400"
                  onClick={() => handleDeleteKol(kol.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add KOL Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="cyber-card p-6">
              <h2 className="text-xl font-bold mb-4">添加新 KOL</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">名称</label>
                  <Input
                    placeholder="输入 KOL 名称"
                    value={newKol.name}
                    onChange={(e) => setNewKol({ ...newKol, name: e.target.value })}
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">用户名</label>
                  <Input
                    placeholder="@username"
                    value={newKol.handle}
                    onChange={(e) => setNewKol({ ...newKol, handle: e.target.value })}
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">平台</label>
                  <select
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md"
                    value={newKol.platform}
                    onChange={(e) => setNewKol({ ...newKol, platform: e.target.value })}
                  >
                    <option value="twitter">Twitter</option>
                    <option value="weibo">微博</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  variant="cyber"
                  onClick={handleAddKol}
                  className="flex-1"
                >
                  添加 KOL
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}