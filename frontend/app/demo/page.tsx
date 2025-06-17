'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, PlayCircle } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="cyber-card p-8">
          <div className="text-center mb-8">
            <PlayCircle className="h-16 w-16 mx-auto mb-4 text-cyber-neon-cyan animate-pulse-neon" />
            <h1 className="text-3xl font-bold font-orbitron mb-4">System Demo</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the power of our emotion propagation analysis system. 
              The demo provides full access to all features with sample data.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-black/30 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2">Demo Credentials</h3>
              <p className="text-sm text-gray-400">Username: <span className="font-mono text-cyber-neon-cyan">admin</span></p>
              <p className="text-sm text-gray-400">Password: <span className="font-mono text-cyber-neon-cyan">admin</span></p>
            </div>

            <div className="p-4 bg-black/30 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2">包含内容</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• 50+ 预配置的 KOL 和实时数据</li>
                <li>• 活跃的事件监控和预警</li>
                <li>• 历史情绪趋势分析</li>
                <li>• 交互式数据可视化</li>
                <li>• 完整的控制台功能</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="cyber"
              className="flex-1"
              onClick={() => router.push('/login')}
            >
              Start Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}