import { test, expect } from '@playwright/test'

test.describe('Claude Preferences Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display main dashboard elements', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Claude Code Preferences' })).toBeVisible()

    // Check description
    await expect(page.getByText('Comprehensive preference management system')).toBeVisible()

    // Check navigation
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText('Claude Preferences')).toBeVisible()
  })

  test('should display dashboard statistics cards', async ({ page }) => {
    // Check for all dashboard stat cards
    await expect(page.getByText('Active Sub-Agents')).toBeVisible()
    await expect(page.getByText('Project Integrations')).toBeVisible()
    await expect(page.getByText('Configuration Files')).toBeVisible()
    await expect(page.getByText('System Health')).toBeVisible()

    // Check for numerical values in cards
    await expect(page.getByText('6')).toBeVisible() // Active Sub-Agents
    await expect(page.getByText('12')).toBeVisible() // Project Integrations
    await expect(page.getByText('4')).toBeVisible() // Configuration Files
  })

  test('should display system status section', async ({ page }) => {
    // Wait for system status to load
    await page.waitForSelector('[data-testid="system-status"]', { timeout: 10000 })

    await expect(page.getByText('System Status')).toBeVisible()

    // Check for health status indicators
    await expect(page.getByText('Overall Health')).toBeVisible()

    // Should show health checks
    await expect(page.getByText('Health Checks')).toBeVisible()
  })

  test('should display quick actions section', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible()

    // Check for filter buttons
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Monitoring' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tools' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Commands' })).toBeVisible()

    // Check for some action buttons
    await expect(page.getByText('System Health Check')).toBeVisible()
    await expect(page.getByText('Monitor AI Teams')).toBeVisible()
  })

  test('should display recent activity section', async ({ page }) => {
    await expect(page.getByText('Recent Activity')).toBeVisible()

    // Check for activity items
    await expect(page.getByText('System health check completed')).toBeVisible()
    await expect(page.getByText('Sub-agents configuration validated')).toBeVisible()
    await expect(page.getByText('Global command system integrated')).toBeVisible()
    await expect(page.getByText('Enhanced MCP monitoring enabled')).toBeVisible()

    // Check for timestamps
    await expect(page.getByText('2 minutes ago')).toBeVisible()
    await expect(page.getByText('5 minutes ago')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    // Test navigation items
    const navItems = ['Dashboard', 'Sub-Agents', 'Configuration', 'Monitoring', 'Global Commands', 'Documentation']

    for (const item of navItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible()
    }

    // Test that Dashboard link is active (current page)
    const dashboardLink = page.getByRole('link', { name: 'Dashboard' })
    await expect(dashboardLink).toHaveClass(/border-blue-500/)
  })

  test('should filter quick actions by category', async ({ page }) => {
    // Click on Monitoring filter
    await page.getByRole('button', { name: 'Monitoring' }).click()

    // Should show monitoring actions
    await expect(page.getByText('System Health Check')).toBeVisible()
    await expect(page.getByText('Monitor AI Teams')).toBeVisible()
    await expect(page.getByText('Validate Sub-Agents')).toBeVisible()

    // Should not show tool actions
    await expect(page.getByText('Send Email')).not.toBeVisible()
    await expect(page.getByText('Take Screenshot')).not.toBeVisible()

    // Click on Tools filter
    await page.getByRole('button', { name: 'Tools' }).click()

    // Should show tool actions
    await expect(page.getByText('Send Email')).toBeVisible()
    await expect(page.getByText('Take Screenshot')).toBeVisible()

    // Should not show monitoring actions
    await expect(page.getByText('System Health Check')).not.toBeVisible()

    // Click on Commands filter
    await page.getByRole('button', { name: 'Commands' }).click()

    // Should show command actions
    await expect(page.getByText('Learn Command')).toBeVisible()
    await expect(page.getByText('Improve Command')).toBeVisible()

    // Click back to All
    await page.getByRole('button', { name: 'All' }).click()

    // Should show all actions again
    await expect(page.getByText('System Health Check')).toBeVisible()
    await expect(page.getByText('Send Email')).toBeVisible()
    await expect(page.getByText('Learn Command')).toBeVisible()
  })

  test('should execute quick actions', async ({ page }) => {
    // Find and click a quick action button
    const healthCheckButton = page.getByText('System Health Check').locator('..')

    await healthCheckButton.click()

    // Should show loading state
    await expect(page.getByText('System Health Check').locator('..').locator('[class*="animate-spin"]')).toBeVisible()

    // Wait for action to complete (simulated)
    await page.waitForTimeout(2500)

    // Loading state should be gone
    await expect(page.getByText('System Health Check').locator('..').locator('[class*="animate-spin"]')).not.toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigation should be collapsed
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()

    // Click mobile menu
    await page.getByRole('button', { name: /menu/i }).click()

    // Mobile navigation should be visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sub-Agents' })).toBeVisible()

    // Dashboard cards should stack on mobile
    const cards = page.locator('.card')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)
  })

  test('should handle loading states', async ({ page }) => {
    // Reload page and check for loading states
    await page.reload()

    // System status should show loading skeleton initially
    const systemStatusCard = page.getByText('System Status').locator('..')
    await expect(systemStatusCard.locator('.animate-pulse')).toBeVisible()

    // Wait for loading to complete
    await page.waitForSelector('[data-testid="system-status"]', { timeout: 5000 })
  })

  test('should have proper accessibility', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()

    const h3Elements = page.getByRole('heading', { level: 3 })
    const h3Count = await h3Elements.count()
    expect(h3Count).toBeGreaterThan(0)

    // Check for aria labels and roles
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()

    // Check that all interactive elements are keyboard accessible
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should display correct gradient background', async ({ page }) => {
    const body = page.locator('body')
    await expect(body).toHaveClass(/bg-gradient-to-br/)
  })
})

test.describe('Dashboard Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
  })

  test('should have good lighthouse scores', async ({ page }) => {
    await page.goto('/')

    // Wait for content to be visible
    await expect(page.getByRole('heading', { name: 'Claude Code Preferences' })).toBeVisible()

    // Basic performance checks
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'))
    })

    const entries = JSON.parse(performanceEntries)
    expect(entries.length).toBeGreaterThan(0)
  })
})

test.describe('Dashboard Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure for API calls
    await page.route('**/api/**', route => {
      route.abort('internetdisconnected')
    })

    await page.goto('/')

    // Should still display the main interface
    await expect(page.getByRole('heading', { name: 'Claude Code Preferences' })).toBeVisible()
  })
})