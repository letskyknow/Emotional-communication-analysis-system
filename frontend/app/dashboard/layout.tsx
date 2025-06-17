'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Globe,
  Home,
  Menu,
  Settings,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { href: '/dashboard', icon: Home, label: '控制台' },
  { href: '/dashboard/kol', icon: Users, label: 'KOL管理' },
  { href: '/dashboard/events', icon: Globe, label: '事件追踪' },
  { href: '/dashboard/analytics', icon: BarChart3, label: '数据分析' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: '预警中心' },
  { href: '/dashboard/settings', icon: Settings, label: '系统设置' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-cyber-dark border-r border-cyber-neon-cyan/20 lg:relative lg:block',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b border-cyber-neon-cyan/20">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-cyber-neon-cyan animate-pulse-neon" />
              <span className="text-xl font-bold font-orbitron">情绪分析</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            {sidebarItems.map((item) => {
              const isActive = pathname.endsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200',
                    isActive
                      ? 'bg-cyber-neon-cyan/20 text-cyber-neon-cyan border border-cyber-neon-cyan/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-cyber-neon-cyan/10 rounded-lg -z-10"
                    />
                  )}
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-cyber-neon-cyan/20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyber-neon-cyan to-cyber-neon-pink animate-pulse" />
              <div>
                <p className="text-sm font-medium">系统管理员</p>
                <p className="text-xs text-gray-400">在线</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-cyber-neon-cyan/20 bg-cyber-dark/50 backdrop-blur-sm">
          <div className="flex h-full items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Activity className="h-4 w-4 text-cyber-neon-green animate-pulse" />
                <span className="text-gray-400">系统状态：</span>
                <span className="text-cyber-neon-green">正常运行</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4 text-cyber-neon-yellow" />
                <span className="text-gray-400">处理速度：</span>
                <span className="text-cyber-neon-yellow">2,847 推文/分钟</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-cyber-darker">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}