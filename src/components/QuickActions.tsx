'use client'

import { useState } from 'react'
import {
  PlayIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  EnvelopeIcon,
  CameraIcon,
  ChartBarIcon,
  CommandLineIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface QuickAction {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  command: string
  color: string
  category: 'monitoring' | 'tools' | 'commands'
}

const quickActions: QuickAction[] = [
  {
    name: 'System Health Check',
    description: 'Run comprehensive health diagnostics',
    icon: DocumentMagnifyingGlassIcon,
    command: 'npm run doctor',
    color: 'blue',
    category: 'monitoring'
  },
  {
    name: 'Monitor AI Teams',
    description: 'Check AI team status with MCP',
    icon: CpuChipIcon,
    command: 'npm run monitor',
    color: 'purple',
    category: 'monitoring'
  },
  {
    name: 'Validate Sub-Agents',
    description: 'Check all sub-agent configurations',
    icon: CheckCircleIcon,
    command: 'npm run sub-agents',
    color: 'green',
    category: 'monitoring'
  },
  {
    name: 'Send Email',
    description: 'Quick formatted email tool',
    icon: EnvelopeIcon,
    command: 'npm run emailme',
    color: 'yellow',
    category: 'tools'
  },
  {
    name: 'Take Screenshot',
    description: 'Capture website screenshots',
    icon: CameraIcon,
    command: 'npm run screenshot',
    color: 'indigo',
    category: 'tools'
  },
  {
    name: 'Learn Command',
    description: 'Run learning cycle on project',
    icon: CommandLineIcon,
    command: 'npm run learn',
    color: 'pink',
    category: 'commands'
  },
  {
    name: 'Improve Command',
    description: 'Run improvement cycle',
    icon: CommandLineIcon,
    command: 'npm run improve',
    color: 'teal',
    category: 'commands'
  },
  {
    name: 'Performance Analytics',
    description: 'View performance metrics',
    icon: ChartBarIcon,
    command: 'npm run analytics',
    color: 'orange',
    category: 'monitoring'
  }
]

const colorClasses = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
}

export default function QuickActions() {
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'monitoring' | 'tools' | 'commands'>('all')

  const handleActionClick = async (action: QuickAction) => {
    setExecutingAction(action.name)

    // Simulate command execution (in a real app, this would call an API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log(`Executed: ${action.command}`)
    } catch (error) {
      console.error(`Failed to execute ${action.command}:`, error)
    } finally {
      setExecutingAction(null)
    }
  }

  const filteredActions = filter === 'all'
    ? quickActions
    : quickActions.filter(action => action.category === filter)

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>

          {/* Filter Buttons */}
          <div className="flex space-x-1">
            {['all', 'monitoring', 'tools', 'commands'].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category as any)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors duration-200 ${
                  filter === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredActions.map((action) => {
            const Icon = action.icon
            const isExecuting = executingAction === action.name

            return (
              <button
                key={action.name}
                onClick={() => handleActionClick(action)}
                disabled={isExecuting}
                className={`p-4 rounded-lg border border-gray-200 text-left transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  colorClasses[action.color as keyof typeof colorClasses]
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {isExecuting ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{width: '20px', height: '20px'}}></div>
                    ) : (
                      <Icon className="w-5 h-5 flex-shrink-0" style={{width: '20px', height: '20px'}} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.name}</p>
                    <p className="text-xs opacity-75 mt-1">{action.description}</p>
                    <p className="text-xs font-mono mt-2 opacity-60">{action.command}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {filteredActions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No actions found for this category</p>
          </div>
        )}
      </div>
    </div>
  )
}