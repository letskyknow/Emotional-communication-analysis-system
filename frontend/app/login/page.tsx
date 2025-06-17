'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, User, Lock } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.access_token)
        document.cookie = `token=${data.access_token}; path=/`
        toast({
          title: '登录成功',
          description: '欢迎回来！',
        })
        router.push('/dashboard')
      } else {
        // For demo, accept admin/admin
        if (username === 'admin' && password === 'admin') {
          localStorage.setItem('token', 'demo-token')
          document.cookie = 'token=demo-token; path=/'
          router.push('/dashboard')
        } else {
          toast({
            title: '登录失败',
            description: data.message || '用户名或密码错误',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      // Fallback for demo
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('token', 'demo-token')
        document.cookie = 'token=demo-token; path=/'
        router.push('/dashboard')
      } else {
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="cyber-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full bg-gradient-to-br from-cyber-neon-cyan/20 to-cyber-neon-pink/20 mb-4">
              <Zap className="h-8 w-8 text-cyber-neon-cyan" />
            </div>
            <h1 className="text-2xl font-bold font-orbitron">系统登录</h1>
            <p className="text-gray-400 mt-2">欢迎使用情绪传播分析系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-black/50 border-gray-700 focus:border-cyber-neon-cyan"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/50 border-gray-700 focus:border-cyber-neon-cyan"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="cyber"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>演示账号：admin / admin</p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-cyber-neon-cyan hover:text-cyber-neon-pink transition-colors">
              返回首页
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}