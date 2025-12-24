import { ReactElement } from 'react'

interface DashboardCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow'
  description?: string
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600 bg-blue-100',
    border: 'border-blue-200'
  },
  green: {
    icon: 'text-green-600 bg-green-100',
    border: 'border-green-200'
  },
  purple: {
    icon: 'text-purple-600 bg-purple-100',
    border: 'border-purple-200'
  },
  red: {
    icon: 'text-red-600 bg-red-100',
    border: 'border-red-200'
  },
  yellow: {
    icon: 'text-yellow-600 bg-yellow-100',
    border: 'border-yellow-200'
  }
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  description
}: DashboardCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-content">
        <div className="dashboard-card-info">
          <h4>{title}</h4>
          <div className="value">{value}</div>
          {description && (
            <p className="description">{description}</p>
          )}
        </div>
        <div className={`dashboard-card-icon ${color}`}>
          <Icon className="w-6 h-6 flex-shrink-0" style={{width: '24px', height: '24px'}} />
        </div>
      </div>
    </div>
  )
}