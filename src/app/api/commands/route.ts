import { NextRequest, NextResponse } from 'next/server'
import { ClaudeCommands, validateCommand } from '@/lib/commands'

export async function POST(request: NextRequest) {
  try {
    const { command, args, options } = await request.json()

    if (!command) {
      return NextResponse.json({
        success: false,
        error: 'Command is required'
      }, { status: 400 })
    }

    // Validate command for security
    if (!validateCommand(command, args)) {
      return NextResponse.json({
        success: false,
        error: 'Command failed security validation'
      }, { status: 403 })
    }

    let result: any

    // Route to appropriate Claude command
    switch (command) {
      case 'doctor':
        result = await ClaudeCommands.runDoctor()
        break
      case 'validate-configs':
        result = await ClaudeCommands.validateConfigs()
        break
      case 'validate-sub-agents':
        result = await ClaudeCommands.validateSubAgents()
        break
      case 'mcp-monitoring':
        const mode = args?.[0] || 'detailed'
        result = await ClaudeCommands.runMCPMonitoring(mode as 'detailed' | 'quick')
        break
      case 'enhanced-monitoring':
        const monitorMode = args?.[0] || 'full'
        result = await ClaudeCommands.runEnhancedMonitoring(monitorMode as any)
        break
      case 'learn':
        const cycles = parseInt(args?.[0] || '1', 10)
        const projectPath = args?.[1]
        result = await ClaudeCommands.runLearnCommand(cycles, projectPath)
        break
      case 'improve':
        const improveCycles = parseInt(args?.[0] || '1', 10)
        result = await ClaudeCommands.runImproveCommand(improveCycles)
        break
      case 'screenshot':
        if (!args || args.length < 2) {
          return NextResponse.json({
            success: false,
            error: 'Screenshot command requires URL and name arguments'
          }, { status: 400 })
        }
        result = await ClaudeCommands.takeScreenshot(args[0], args[1])
        break
      case 'send-email':
        if (!args || args.length < 1) {
          return NextResponse.json({
            success: false,
            error: 'Email command requires message argument'
          }, { status: 400 })
        }
        result = await ClaudeCommands.sendEmail(args[0])
        break
      case 'sync-projects':
        result = await ClaudeCommands.syncProjects()
        break
      case 'git-status':
        const gitProjectPath = args?.[0]
        result = await ClaudeCommands.getGitStatus(gitProjectPath)
        break
      case 'git-log':
        const count = parseInt(args?.[0] || '5', 10)
        const logProjectPath = args?.[1]
        result = await ClaudeCommands.getGitLog(count, logProjectPath)
        break
      case 'git-health':
        const healthProjectPath = args?.[0]
        result = await ClaudeCommands.checkGitHealth(healthProjectPath)
        break
      case 'check-dependencies':
        result = await ClaudeCommands.checkSystemDependencies()
        break
      case 'npm-script':
        if (!args || args.length < 1) {
          return NextResponse.json({
            success: false,
            error: 'NPM script command requires script name argument'
          }, { status: 400 })
        }
        const scriptProjectPath = args?.[1]
        result = await ClaudeCommands.runNpmScript(args[0], scriptProjectPath)
        break
      case 'install-dependencies':
        const installProjectPath = args?.[0]
        result = await ClaudeCommands.installDependencies(installProjectPath)
        break
      case 'check-outdated':
        const outdatedProjectPath = args?.[0]
        result = await ClaudeCommands.checkOutdatedPackages(outdatedProjectPath)
        break
      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported command: ${command}`
        }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success,
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        duration: result.duration
      },
      message: result.success ? 'Command executed successfully' : 'Command execution failed',
      error: result.error
    })
  } catch (error) {
    console.error('Command execution failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Command execution failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const info = searchParams.get('info')

    if (info === 'available') {
      // Return list of available commands
      const availableCommands = [
        'doctor',
        'validate-configs',
        'validate-sub-agents',
        'mcp-monitoring',
        'enhanced-monitoring',
        'learn',
        'improve',
        'screenshot',
        'send-email',
        'sync-projects',
        'git-status',
        'git-log',
        'git-health',
        'check-dependencies',
        'npm-script',
        'install-dependencies',
        'check-outdated'
      ]

      return NextResponse.json({
        success: true,
        data: {
          commands: availableCommands,
          total: availableCommands.length
        },
        message: 'Available commands retrieved successfully'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid info parameter'
    }, { status: 400 })
  } catch (error) {
    console.error('Failed to get command info:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get command info'
    }, { status: 500 })
  }
}