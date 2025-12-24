'use client'

import { useState, useEffect } from 'react'
import { CpuChipIcon, CogIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import DashboardCard from '@/components/DashboardCard'
import SystemStatus from '@/components/SystemStatus'
import QuickActions from '@/components/QuickActions'

interface SystemHealth {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  checks: Record<string, boolean>
}

export default function Dashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading system health data
    const loadSystemHealth = async () => {
      try {
        // In a real app, this would fetch from an API
        await new Promise(resolve => setTimeout(resolve, 1000))

        setSystemHealth({
          score: 95,
          status: 'excellent',
          checks: {
            'System Dependencies': true,
            'CLAUDE.md Symlink': true,
            'Project Paths': true,
            'Tool Integrations': true,
            'Git Repository': true,
            'Script Permissions': true,
            'Sub-Agents': true,
            'MCP Monitoring': true
          }
        })
      } catch (error) {
        console.error('Failed to load system health:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSystemHealth()
  }, [])

  const dashboardStats = [
    {
      title: 'Active Sub-Agents',
      value: '6',
      icon: CpuChipIcon,
      color: 'blue',
      description: 'All sub-agents operational'
    },
    {
      title: 'Project Integrations',
      value: '12',
      icon: CogIcon,
      color: 'green',
      description: 'Connected project paths'
    },
    {
      title: 'Configuration Files',
      value: '4',
      icon: DocumentTextIcon,
      color: 'purple',
      description: 'Validated config files'
    },
    {
      title: 'System Health',
      value: isLoading ? '...' : `${systemHealth?.score || 0}%`,
      icon: ChartBarIcon,
      color: systemHealth?.status === 'excellent' ? 'green' :
            systemHealth?.status === 'good' ? 'blue' :
            systemHealth?.status === 'fair' ? 'yellow' : 'red',
      description: isLoading ? 'Loading...' : `Status: ${systemHealth?.status || 'unknown'}`
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="header">
        <h1>Claude Code Preferences</h1>
        <p>
          Comprehensive preference management system for Claude Code across all projects and devices.
          Monitor sub-agents, manage configurations, and optimize your AI development workflow.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-grid">
        {dashboardStats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            description={stat.description}
          />
        ))}
      </div>

      <div className="content-grid">
        {/* System Status */}
        <div className="space-y-6">
          <SystemStatus health={systemHealth} isLoading={isLoading} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="status-active"></div>
              <span className="text-sm text-gray-600">System health check completed - All systems operational</span>
              <span className="text-xs text-gray-400 ml-auto">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="status-active"></div>
              <span className="text-sm text-gray-600">Sub-agents configuration validated successfully</span>
              <span className="text-xs text-gray-400 ml-auto">5 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="status-active"></div>
              <span className="text-sm text-gray-600">Global command system integrated</span>
              <span className="text-xs text-gray-400 ml-auto">10 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="status-active"></div>
              <span className="text-sm text-gray-600">Enhanced MCP monitoring enabled</span>
              <span className="text-xs text-gray-400 ml-auto">15 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}