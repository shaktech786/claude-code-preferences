import { exec, execSync } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import type { CommandExecution, CommandResult, ApiResponse } from '@/types'

const execAsync = promisify(exec)

export class CommandExecutor {
  private readonly timeout: number = 30000 // 30 seconds default timeout

  constructor(defaultTimeout?: number) {
    if (defaultTimeout) {
      this.timeout = defaultTimeout
    }
  }

  // Execute command asynchronously
  async execute(execution: CommandExecution): Promise<CommandResult> {
    const startTime = Date.now()

    try {
      const options = {
        timeout: execution.timeout || this.timeout,
        cwd: execution.workingDirectory || process.cwd(),
        env: { ...process.env, ...execution.environment }
      }

      const commandString = execution.args
        ? `${execution.command} ${execution.args.join(' ')}`
        : execution.command

      const { stdout, stderr } = await execAsync(commandString, options)

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        duration: Date.now() - startTime
      }
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || '',
        exitCode: error.code || 1,
        duration: Date.now() - startTime,
        error: error.message
      }
    }
  }

  // Execute command synchronously
  executeSync(execution: CommandExecution): CommandResult {
    const startTime = Date.now()

    try {
      const options = {
        timeout: execution.timeout || this.timeout,
        cwd: execution.workingDirectory || process.cwd(),
        env: { ...process.env, ...execution.environment },
        encoding: 'utf8' as const
      }

      const commandString = execution.args
        ? `${execution.command} ${execution.args.join(' ')}`
        : execution.command

      const output = execSync(commandString, options)

      return {
        success: true,
        stdout: typeof output === 'string' ? output.trim() : '',
        stderr: '',
        exitCode: 0,
        duration: Date.now() - startTime
      }
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout?.toString().trim() || '',
        stderr: error.stderr?.toString().trim() || '',
        exitCode: error.status || 1,
        duration: Date.now() - startTime,
        error: error.message
      }
    }
  }

  // Execute multiple commands in sequence
  async executeSequence(executions: CommandExecution[]): Promise<CommandResult[]> {
    const results: CommandResult[] = []

    for (const execution of executions) {
      const result = await this.execute(execution)
      results.push(result)

      // Stop on first failure unless explicitly told to continue
      if (!result.success && !execution.environment?.CONTINUE_ON_ERROR) {
        break
      }
    }

    return results
  }

  // Execute commands in parallel
  async executeParallel(executions: CommandExecution[]): Promise<CommandResult[]> {
    const promises = executions.map(execution => this.execute(execution))
    return Promise.all(promises)
  }
}

// Predefined command builders
export class ClaudeCommands {
  private static executor = new CommandExecutor()

  // System health commands
  static async runDoctor(): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: ['scripts/doctor.js'],
      workingDirectory: process.cwd()
    })
  }

  static async validateConfigs(): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: ['scripts/validate-config.js'],
      workingDirectory: process.cwd()
    })
  }

  static async validateSubAgents(): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: ['scripts/validate-sub-agents.js'],
      workingDirectory: process.cwd()
    })
  }

  // Monitoring commands
  static async runMCPMonitoring(mode: 'detailed' | 'quick' = 'detailed'): Promise<CommandResult> {
    const script = '/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/claude-monitoring-mcp-client.py'
    return this.executor.execute({
      command: 'python3',
      args: mode === 'quick' ? [script, '--quick'] : [script],
      timeout: 60000 // 1 minute timeout for monitoring
    })
  }

  static async runEnhancedMonitoring(mode: 'full' | 'quick' | 'git' | 'stuck' = 'full'): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: ['scripts/enhanced-monitoring.js', mode],
      workingDirectory: process.cwd(),
      timeout: 120000 // 2 minutes timeout
    })
  }

  // Global commands
  static async runLearnCommand(cycles: number = 1, projectPath?: string): Promise<CommandResult> {
    const args = projectPath ? [cycles.toString(), projectPath] : [cycles.toString()]
    return this.executor.execute({
      command: 'node',
      args: ['/Users/shakeelbhamani/.claude/commands/learn.js', ...args],
      timeout: 300000, // 5 minutes timeout
      workingDirectory: projectPath || process.cwd()
    })
  }

  static async runImproveCommand(cycles: number = 1): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: ['/Users/shakeelbhamani/.claude/commands/improve.js', cycles.toString()],
      timeout: 300000, // 5 minutes timeout
      workingDirectory: process.cwd()
    })
  }

  // Tool commands
  static async takeScreenshot(url: string, name: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: [
        '/Users/shakeelbhamani/projects/personal/shaktech-website/scripts/capture-screenshot.js',
        url,
        name
      ],
      timeout: 60000 // 1 minute timeout
    })
  }

  static async sendEmail(message: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'node',
      args: ['scripts/quick-email.js', message],
      workingDirectory: process.cwd()
    })
  }

  static async syncProjects(): Promise<CommandResult> {
    return this.executor.execute({
      command: './scripts/project-sync.sh',
      workingDirectory: process.cwd()
    })
  }

  // Git commands
  static async getGitStatus(projectPath?: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'git',
      args: ['status', '--porcelain'],
      workingDirectory: projectPath || process.cwd()
    })
  }

  static async getGitLog(count: number = 5, projectPath?: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'git',
      args: ['log', '--oneline', `-${count}`],
      workingDirectory: projectPath || process.cwd()
    })
  }

  static async checkGitHealth(projectPath?: string): Promise<CommandResult> {
    const commands = [
      { command: 'git', args: ['status'] },
      { command: 'git', args: ['remote', '-v'] },
      { command: 'git', args: ['log', '--oneline', '-5'] }
    ]

    const results = await this.executor.executeSequence(
      commands.map(cmd => ({
        ...cmd,
        workingDirectory: projectPath || process.cwd()
      }))
    )

    const allSuccessful = results.every(r => r.success)
    const combinedOutput = results.map(r => r.stdout || r.error).join('\n---\n')

    return {
      success: allSuccessful,
      stdout: combinedOutput,
      stderr: results.map(r => r.stderr).filter(Boolean).join('\n'),
      exitCode: allSuccessful ? 0 : 1,
      duration: results.reduce((sum, r) => sum + r.duration, 0)
    }
  }

  // System commands
  static async checkSystemDependencies(): Promise<CommandResult> {
    const dependencies = [
      { name: 'Node.js', command: 'node', args: ['--version'] },
      { name: 'npm', command: 'npm', args: ['--version'] },
      { name: 'Git', command: 'git', args: ['--version'] },
      { name: 'Python3', command: 'python3', args: ['--version'] },
      { name: 'tmux', command: 'tmux', args: ['-V'] }
    ]

    const results = await this.executor.executeParallel(
      dependencies.map(dep => ({
        command: dep.command,
        args: dep.args
      }))
    )

    const summary = dependencies.map((dep, index) => {
      const result = results[index]
      return `${dep.name}: ${result.success ? result.stdout : 'Not found'}`
    }).join('\n')

    const allFound = results.every(r => r.success)

    return {
      success: allFound,
      stdout: summary,
      stderr: '',
      exitCode: allFound ? 0 : 1,
      duration: Math.max(...results.map(r => r.duration))
    }
  }

  // NPM commands
  static async runNpmScript(script: string, projectPath?: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'npm',
      args: ['run', script],
      workingDirectory: projectPath || process.cwd(),
      timeout: 180000 // 3 minutes timeout
    })
  }

  static async installDependencies(projectPath?: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'npm',
      args: ['install'],
      workingDirectory: projectPath || process.cwd(),
      timeout: 300000 // 5 minutes timeout
    })
  }

  static async checkOutdatedPackages(projectPath?: string): Promise<CommandResult> {
    return this.executor.execute({
      command: 'npm',
      args: ['outdated'],
      workingDirectory: projectPath || process.cwd()
    })
  }
}

// Utility functions for command validation and safety
export function validateCommand(command: string, args?: string[]): boolean {
  // Basic validation - can be extended with more security checks
  const dangerousCommands = ['rm -rf', 'sudo rm', 'format', 'fdisk']
  const fullCommand = args ? `${command} ${args.join(' ')}` : command

  return !dangerousCommands.some(dangerous => fullCommand.includes(dangerous))
}

export function sanitizeCommandArgs(args: string[]): string[] {
  return args.map(arg => {
    // Remove potentially dangerous characters
    return arg.replace(/[;&|`$(){}]/g, '')
  })
}

// Export default executor instance
export const commandExecutor = new CommandExecutor()

// Quick command execution functions
export async function quickExecute(command: string, args?: string[], options?: Partial<CommandExecution>): Promise<CommandResult> {
  if (!validateCommand(command, args)) {
    return {
      success: false,
      error: 'Command failed security validation',
      duration: 0,
      exitCode: 1
    }
  }

  return commandExecutor.execute({
    command,
    args: args ? sanitizeCommandArgs(args) : undefined,
    ...options
  })
}

export function quickExecuteSync(command: string, args?: string[], options?: Partial<CommandExecution>): CommandResult {
  if (!validateCommand(command, args)) {
    return {
      success: false,
      error: 'Command failed security validation',
      duration: 0,
      exitCode: 1
    }
  }

  return commandExecutor.executeSync({
    command,
    args: args ? sanitizeCommandArgs(args) : undefined,
    ...options
  })
}