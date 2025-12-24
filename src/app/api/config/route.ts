import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let data: any = {}

    switch (type) {
      case 'project-paths':
        data = configManager.getProjectPaths()
        break
      case 'development-settings':
        data = configManager.getDevelopmentSettings()
        break
      case 'sub-agents':
        data = configManager.getSubAgentsConfig()
        break
      case 'tool-permissions':
        data = configManager.getToolPermissions()
        break
      case 'all':
      default:
        data = {
          projectPaths: configManager.getProjectPaths(),
          developmentSettings: configManager.getDevelopmentSettings(),
          subAgents: configManager.getSubAgentsConfig(),
          toolPermissions: configManager.getToolPermissions()
        }
        break
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: `Configuration type '${type}' not found`
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Configuration retrieved successfully`
    })
  } catch (error) {
    console.error('Failed to get configuration:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get configuration'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({
        success: false,
        error: 'Type and data are required'
      }, { status: 400 })
    }

    let updateResult = false

    switch (type) {
      case 'project-paths':
        updateResult = configManager.updateProjectPaths(data)
        break
      case 'development-settings':
        updateResult = configManager.updateDevelopmentSettings(data)
        break
      case 'sub-agents':
        updateResult = configManager.updateSubAgentsConfig(data)
        break
      case 'tool-permissions':
        updateResult = configManager.updateToolPermissions(data)
        break
      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported configuration type: ${type}`
        }, { status: 400 })
    }

    if (!updateResult) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update configuration'
      }, { status: 500 })
    }

    // Log the configuration change
    configManager.logConfigChange({
      type,
      path: 'api-update',
      value: data,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Configuration updated successfully`
    })
  } catch (error) {
    console.error('Failed to update configuration:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update configuration'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()

    let result: any = false

    switch (action) {
      case 'add-project-path':
        result = configManager.addProjectPath(params.name, params.path)
        break
      case 'remove-project-path':
        result = configManager.removeProjectPath(params.name)
        break
      case 'toggle-sub-agent':
        result = configManager.toggleSubAgent(params.agentName, params.active)
        break
      case 'update-sub-agent-priority':
        result = configManager.updateSubAgentPriority(params.agentName, params.priority)
        break
      case 'add-allowed-tool':
        result = configManager.addAllowedTool(params.toolPattern)
        break
      case 'remove-allowed-tool':
        result = configManager.removeAllowedTool(params.toolPattern)
        break
      case 'validate-all':
        const health = await configManager.runHealthCheck()
        result = { health, valid: health.score >= 80 }
        break
      case 'create-backup':
        result = { backupPath: configManager.createBackup() }
        break
      case 'restore-backup':
        result = configManager.restoreFromBackup(params.backupPath)
        break
      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported action: ${action}`
        }, { status: 400 })
    }

    return NextResponse.json({
      success: !!result,
      data: result,
      message: `Action '${action}' completed successfully`
    })
  } catch (error) {
    console.error('Failed to execute configuration action:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute action'
    }, { status: 500 })
  }
}