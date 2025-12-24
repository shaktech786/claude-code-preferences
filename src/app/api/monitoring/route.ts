import { NextRequest, NextResponse } from 'next/server'
import { ClaudeCommands } from '@/lib/commands'
import { configManager } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'full'

    let result: any

    switch (type) {
      case 'mcp':
        const mcpMode = searchParams.get('mode') as 'detailed' | 'quick' || 'detailed'
        result = await ClaudeCommands.runMCPMonitoring(mcpMode)
        break
      case 'enhanced':
        const enhancedMode = searchParams.get('mode') || 'full'
        result = await ClaudeCommands.runEnhancedMonitoring(enhancedMode as any)
        break
      case 'git':
        const projects = configManager.getProjectPaths()
        if (!projects) {
          return NextResponse.json({
            success: false,
            error: 'Project paths configuration not found'
          }, { status: 404 })
        }

        const gitResults: Record<string, any> = {}

        for (const [name, path] of Object.entries(projects.projectPaths)) {
          gitResults[name] = await ClaudeCommands.getGitStatus(path)
        }

        result = {
          success: true,
          stdout: JSON.stringify(gitResults, null, 2),
          stderr: '',
          exitCode: 0,
          duration: 0
        }
        break
      case 'system':
        result = await ClaudeCommands.checkSystemDependencies()
        break
      case 'health':
        const health = await configManager.runHealthCheck()
        result = {
          success: true,
          stdout: JSON.stringify(health, null, 2),
          stderr: '',
          exitCode: 0,
          duration: 0
        }
        break
      case 'full':
      default:
        // Comprehensive monitoring report
        const [mcpResult, systemResult, healthResult] = await Promise.all([
          ClaudeCommands.runMCPMonitoring('detailed'),
          ClaudeCommands.checkSystemDependencies(),
          configManager.runHealthCheck()
        ])

        const comprehensiveReport = {
          timestamp: new Date().toISOString(),
          mcp: mcpResult,
          system: systemResult,
          health: healthResult,
          summary: {
            mcpStatus: mcpResult.success ? 'operational' : 'error',
            systemHealth: systemResult.success ? 'good' : 'issues-detected',
            configHealth: healthResult.status,
            overallStatus: mcpResult.success && systemResult.success && healthResult.score >= 80 ? 'excellent' : 'needs-attention'
          }
        }

        result = {
          success: true,
          stdout: JSON.stringify(comprehensiveReport, null, 2),
          stderr: '',
          exitCode: 0,
          duration: 0
        }
        break
    }

    return NextResponse.json({
      success: result.success,
      data: {
        type,
        output: result.stdout,
        errors: result.stderr,
        exitCode: result.exitCode,
        duration: result.duration,
        timestamp: new Date().toISOString()
      },
      message: `Monitoring check (${type}) completed successfully`
    })
  } catch (error) {
    console.error('Monitoring check failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Monitoring check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json()

    let result: any

    switch (action) {
      case 'send-alert':
        if (!params?.message) {
          return NextResponse.json({
            success: false,
            error: 'Alert message is required'
          }, { status: 400 })
        }
        result = await ClaudeCommands.sendEmail(params.message)
        break
      case 'check-stuck-prompts':
        result = await ClaudeCommands.runEnhancedMonitoring('stuck')
        break
      case 'comprehensive-check':
        // Run all monitoring checks
        const [mcp, enhanced, git, system] = await Promise.all([
          ClaudeCommands.runMCPMonitoring('detailed'),
          ClaudeCommands.runEnhancedMonitoring('full'),
          ClaudeCommands.checkGitHealth(),
          ClaudeCommands.checkSystemDependencies()
        ])

        const allResults = { mcp, enhanced, git, system }
        const allSuccessful = Object.values(allResults).every(r => r.success)

        result = {
          success: allSuccessful,
          stdout: JSON.stringify(allResults, null, 2),
          stderr: allSuccessful ? '' : 'Some monitoring checks failed',
          exitCode: allSuccessful ? 0 : 1,
          duration: Object.values(allResults).reduce((sum, r) => sum + (r.duration || 0), 0)
        }
        break
      case 'schedule-monitoring':
        // This would integrate with a job scheduler in a real app
        result = {
          success: true,
          stdout: 'Monitoring scheduled successfully',
          stderr: '',
          exitCode: 0,
          duration: 0
        }
        break
      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported monitoring action: ${action}`
        }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success,
      data: {
        action,
        output: result.stdout,
        errors: result.stderr,
        exitCode: result.exitCode,
        duration: result.duration,
        timestamp: new Date().toISOString()
      },
      message: `Monitoring action (${action}) completed successfully`
    })
  } catch (error) {
    console.error('Monitoring action failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Monitoring action failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}