'use client'

import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface SystemHealth {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  checks: Record<string, boolean>
}

interface SystemStatusProps {
  health: SystemHealth | null
  isLoading: boolean
}

export default function SystemStatus({ health, isLoading }: SystemStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100'
      case 'good':
        return 'text-blue-600 bg-blue-100'
      case 'fair':
        return 'text-yellow-600 bg-yellow-100'
      case 'poor':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return CheckCircleIcon
      case 'fair':
      case 'poor':
        return XCircleIcon
      default:
        return ClockIcon
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <div className="card-content">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <div className="card-content">
          <p className="text-gray-500">Unable to load system status</p>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(health.status)

  return (
    <div className="card" data-testid="system-status">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <div className={`status-badge ${health.status}`}>
            <StatusIcon className="w-4 h-4 flex-shrink-0" style={{width: '16px', height: '16px'}} />
            <span>{health.status.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="card-content">
        {/* Overall Health Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Health</span>
            <span className="text-lg font-bold text-gray-900">{health.score}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${health.score}%` }}></div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="health-checks">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Health Checks</h4>
          {Object.entries(health.checks).map(([check, passed]) => (
            <div key={check} className="health-check">
              <span className="text-sm text-gray-600">{check}</span>
              <div className={`health-check-status ${passed ? 'pass' : 'fail'}`}>
                {passed ? (
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" style={{width: '16px', height: '16px'}} />
                ) : (
                  <XCircleIcon className="w-4 h-4 flex-shrink-0" style={{width: '16px', height: '16px'}} />
                )}
                <span className="text-xs font-medium">
                  {passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}