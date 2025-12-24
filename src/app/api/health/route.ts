import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config'
import { ClaudeCommands } from '@/lib/commands'

export async function GET(request: NextRequest) {
  try {
    // Run comprehensive health check
    const health = await configManager.runHealthCheck()

    // Add additional system checks
    const systemDepsResult = await ClaudeCommands.checkSystemDependencies()

    // Enhance health data with system information
    const enhancedHealth = {
      ...health,
      systemDependencies: {
        available: systemDepsResult.success,
        details: systemDepsResult.stdout
      },
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json({
      success: true,
      data: enhancedHealth,
      message: 'Health check completed successfully'
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { checks } = await request.json()

    // Run specific health checks if requested
    const results: Record<string, any> = {}

    if (!checks || checks.includes('config')) {
      results.config = await configManager.runHealthCheck()
    }

    if (!checks || checks.includes('dependencies')) {
      results.dependencies = await ClaudeCommands.checkSystemDependencies()
    }

    if (!checks || checks.includes('git')) {
      results.git = await ClaudeCommands.checkGitHealth()
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Targeted health checks completed'
    })
  } catch (error) {
    console.error('Targeted health check failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 500 })
  }
}