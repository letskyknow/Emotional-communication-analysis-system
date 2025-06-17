'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Activity, 
  Globe, 
  Zap, 
  Network,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react'
import { MatrixRain } from '@/components/effects/matrix-rain'
import { GlowingOrb } from '@/components/effects/glowing-orb'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />
      <GlowingOrb />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="glitch" data-text="情绪">情绪</span>
              <br />
              <span className="text-3xl md:text-5xl holographic">
                传播分析系统
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-8 font-mono">
              实时追踪社交网络情绪传播动态
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="cyber-button text-lg px-8 py-6"
                onClick={() => router.push('/login')}
              >
                <Zap className="mr-2 h-5 w-5" />
                登录系统
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-cyber-neon-pink text-cyber-neon-pink hover:bg-cyber-neon-pink/10"
                onClick={() => router.push('/demo')}
              >
                查看演示
              </Button>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="neon-card"
              >
                <div className="neon-card-inner text-center">
                  <div className="text-3xl font-bold text-cyber-neon-cyan">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-12 holographic"
          >
            系统功能
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group"
              >
                <div className="relative p-6 rounded-lg border border-cyber-neon-cyan/20 bg-cyber-dark/50 backdrop-blur-sm hover:border-cyber-neon-cyan/50 transition-all duration-300 hover:shadow-neon-cyan">
                  <feature.icon className="h-12 w-12 mb-4 text-cyber-neon-cyan group-hover:animate-pulse-neon" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const stats = [
  { value: '50+', label: 'KOL追踪' },
  { value: '10K+', label: '推文/小时' },
  { value: '<100ms', label: '延迟' },
  { value: '99.9%', label: '在线率' },
]

const features = [
  {
    icon: Brain,
    title: 'AI智能分析',
    description: '先进的NLP模型进行多维度情绪检测',
  },
  {
    icon: Network,
    title: '传播路径追踪',
    description: '实时可视化情绪传播模式',
  },
  {
    icon: Activity,
    title: '实时监控',
    description: '持续监测社交媒体情绪数据流',
  },
  {
    icon: BarChart3,
    title: '深度分析',
    description: '全面的洞察和预测建模',
  },
  {
    icon: Globe,
    title: '全球覆盖',
    description: '多语言支持的全球情绪追踪',
  },
  {
    icon: Shield,
    title: '智能预警',
    description: '异常检测智能通知系统',
  },
  {
    icon: Sparkles,
    title: '趋势预测',
    description: '机器学习驱动的情绪趋势预测',
  },
  {
    icon: Zap,
    title: '实时处理',
    description: '亚秒级延迟的关键洞察',
  },
]