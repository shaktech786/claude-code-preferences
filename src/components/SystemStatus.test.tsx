import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SystemStatus from './SystemStatus'
import type { SystemHealth } from '@/types'

describe('SystemStatus Component', () => {
  const mockHealthExcellent: SystemHealth = {
    score: 100,
    status: 'excellent',
    checks: {
      'System Dependencies': true,
      'CLAUDE.md Symlink': true,
      'Project Paths': true,
      'Tool Integrations': true,
      'Git Repository': true,
      'Script Permissions': true
    }
  }

  const mockHealthPoor: SystemHealth = {
    score: 45,
    status: 'poor',
    checks: {
      'System Dependencies': true,
      'CLAUDE.md Symlink': false,
      'Project Paths': false,
      'Tool Integrations': true,
      'Git Repository': false,
      'Script Permissions': true
    }
  }

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<SystemStatus health={null} isLoading={true} />)

      expect(screen.getByText('System Status')).toBeInTheDocument()
      expect(screen.getByText('System Status').closest('.card')).toBeInTheDocument()

      // Check for loading skeleton elements
      const skeletonElements = screen.container.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should not display health data when loading', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={true} />)

      expect(screen.queryByText('EXCELLENT')).not.toBeInTheDocument()
      expect(screen.queryByText('100%')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when health is null and not loading', () => {
      render(<SystemStatus health={null} isLoading={false} />)

      expect(screen.getByText('System Status')).toBeInTheDocument()
      expect(screen.getByText('Unable to load system status')).toBeInTheDocument()
    })
  })

  describe('Excellent Health', () => {
    it('should display excellent health status correctly', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      expect(screen.getByText('EXCELLENT')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('Overall Health')).toBeInTheDocument()

      // Check progress bar
      const progressBar = screen.container.querySelector('[style*="width: 100%"]')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveClass('bg-green-500')
    })

    it('should show all health checks as passing', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      // All checks should show as PASS
      const passElements = screen.getAllByText('PASS')
      expect(passElements).toHaveLength(Object.keys(mockHealthExcellent.checks).length)

      // No FAIL elements should be present
      expect(screen.queryByText('FAIL')).not.toBeInTheDocument()
    })

    it('should display green check icons for all checks', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      const checkIcons = screen.container.querySelectorAll('.text-green-500')
      expect(checkIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Poor Health', () => {
    it('should display poor health status correctly', () => {
      render(<SystemStatus health={mockHealthPoor} isLoading={false} />)

      expect(screen.getByText('POOR')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()

      // Check progress bar color for poor health
      const progressBar = screen.container.querySelector('[style*="width: 45%"]')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveClass('bg-red-500')
    })

    it('should show mixed health check results', () => {
      render(<SystemStatus health={mockHealthPoor} isLoading={false} />)

      // Should have both PASS and FAIL results
      expect(screen.getAllByText('PASS')).toHaveLength(3)
      expect(screen.getAllByText('FAIL')).toHaveLength(3)
    })

    it('should display appropriate icons for each check status', () => {
      render(<SystemStatus health={mockHealthPoor} isLoading={false} />)

      const greenIcons = screen.container.querySelectorAll('.text-green-500')
      const redIcons = screen.container.querySelectorAll('.text-red-500')

      expect(greenIcons.length).toBe(3) // Passing checks
      expect(redIcons.length).toBeGreaterThanOrEqual(3) // Failing checks + status icon
    })
  })

  describe('Health Check Details', () => {
    it('should display all health check names', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      Object.keys(mockHealthExcellent.checks).forEach(checkName => {
        expect(screen.getByText(checkName)).toBeInTheDocument()
      })
    })

    it('should have proper structure for health checks section', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      expect(screen.getByText('Health Checks')).toBeInTheDocument()

      // Each health check should have a proper layout
      Object.keys(mockHealthExcellent.checks).forEach(checkName => {
        const checkElement = screen.getByText(checkName)
        expect(checkElement.closest('.flex')).toBeInTheDocument()
      })
    })
  })

  describe('Progress Bar', () => {
    it('should show correct progress bar color for different health scores', () => {
      const testCases = [
        { score: 100, expectedClass: 'bg-green-500' },
        { score: 85, expectedClass: 'bg-blue-500' },
        { score: 65, expectedClass: 'bg-yellow-500' },
        { score: 30, expectedClass: 'bg-red-500' }
      ]

      testCases.forEach(({ score, expectedClass }) => {
        const health: SystemHealth = {
          score,
          status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor',
          checks: {}
        }

        const { container } = render(<SystemStatus health={health} isLoading={false} />)
        const progressBar = container.querySelector(`[style*="width: ${score}%"]`)

        expect(progressBar).toHaveClass(expectedClass)
      })
    })
  })

  describe('Last Updated', () => {
    it('should display last updated timestamp', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      const mainHeading = screen.getByRole('heading', { level: 3 })
      expect(mainHeading).toHaveTextContent('System Status')

      const subHeading = screen.getByRole('heading', { level: 4 })
      expect(subHeading).toHaveTextContent('Health Checks')
    })

    it('should have accessible text for status indicators', () => {
      render(<SystemStatus health={mockHealthPoor} isLoading={false} />)

      // Status indicators should have meaningful text
      const passIndicators = screen.getAllByText('PASS')
      const failIndicators = screen.getAllByText('FAIL')

      passIndicators.forEach(indicator => {
        expect(indicator).toHaveClass('text-green-600')
      })

      failIndicators.forEach(indicator => {
        expect(indicator).toHaveClass('text-red-600')
      })
    })
  })

  describe('Visual Styling', () => {
    it('should apply correct styling classes', () => {
      const { container } = render(<SystemStatus health={mockHealthExcellent} isLoading={false} />)

      // Card should have proper styling
      const card = container.querySelector('.card')
      expect(card).toBeInTheDocument()

      // Status badge should have proper styling
      const statusBadge = screen.getByText('EXCELLENT').closest('div')
      expect(statusBadge).toHaveClass('text-green-700', 'bg-green-100')
    })
  })
})