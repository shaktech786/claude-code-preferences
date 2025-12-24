import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exec, execSync } from 'child_process'
import { CommandExecutor, ClaudeCommands, validateCommand, sanitizeCommandArgs } from './commands'

// Mock child_process
vi.mock('child_process')

describe('CommandExecutor', () => {
  let executor: CommandExecutor

  beforeEach(() => {
    executor = new CommandExecutor()
    vi.clearAllMocks()
  })

  describe('executeSync', () => {
    it('should execute command synchronously and return result', () => {
      const mockOutput = 'test output'
      vi.mocked(execSync).mockReturnValue(mockOutput)

      const result = executor.executeSync({
        command: 'echo',
        args: ['hello']
      })

      expect(result.success).toBe(true)
      expect(result.stdout).toBe(mockOutput)
      expect(result.exitCode).toBe(0)
      expect(execSync).toHaveBeenCalledWith(
        'echo hello',
        expect.objectContaining({
          timeout: 30000,
          cwd: expect.any(String),
          encoding: 'utf8'
        })
      )
    })

    it('should handle command execution errors', () => {
      const mockError = new Error('Command failed')
      mockError.status = 1
      mockError.stdout = Buffer.from('stdout content')
      mockError.stderr = Buffer.from('stderr content')

      vi.mocked(execSync).mockImplementation(() => {
        throw mockError
      })

      const result = executor.executeSync({
        command: 'invalid-command'
      })

      expect(result.success).toBe(false)
      expect(result.exitCode).toBe(1)
      expect(result.error).toBe('Command failed')
      expect(result.stdout).toBe('stdout content')
      expect(result.stderr).toBe('stderr content')
    })
  })

  describe('execute', () => {
    it('should execute command asynchronously', async () => {
      const mockPromisify = vi.fn().mockResolvedValue({
        stdout: 'async output',
        stderr: ''
      })

      // Mock the promisified exec
      vi.doMock('util', () => ({
        promisify: () => mockPromisify
      }))

      const result = await executor.execute({
        command: 'echo',
        args: ['async']
      })

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('async output')
    })
  })

  describe('executeSequence', () => {
    it('should execute commands in sequence', async () => {
      const mockPromisify = vi.fn()
        .mockResolvedValueOnce({ stdout: 'output1', stderr: '' })
        .mockResolvedValueOnce({ stdout: 'output2', stderr: '' })

      vi.doMock('util', () => ({
        promisify: () => mockPromisify
      }))

      const commands = [
        { command: 'echo', args: ['first'] },
        { command: 'echo', args: ['second'] }
      ]

      const results = await executor.executeSequence(commands)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
    })

    it('should stop on first failure unless told to continue', async () => {
      const mockPromisify = vi.fn()
        .mockRejectedValueOnce(new Error('First command failed'))
        .mockResolvedValueOnce({ stdout: 'output2', stderr: '' })

      vi.doMock('util', () => ({
        promisify: () => mockPromisify
      }))

      const commands = [
        { command: 'failing-command' },
        { command: 'echo', args: ['second'] }
      ]

      const results = await executor.executeSequence(commands)

      expect(results).toHaveLength(1) // Should stop after first failure
      expect(results[0].success).toBe(false)
    })
  })
})

describe('ClaudeCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('runDoctor', () => {
    it('should execute doctor script', async () => {
      vi.mocked(execSync).mockReturnValue('Health check passed')

      const result = await ClaudeCommands.runDoctor()

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('Health check passed')
    })
  })

  describe('runMCPMonitoring', () => {
    it('should execute MCP monitoring with correct arguments', async () => {
      vi.mocked(execSync).mockReturnValue('MCP monitoring result')

      const result = await ClaudeCommands.runMCPMonitoring('quick')

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('MCP monitoring result')
    })
  })

  describe('runLearnCommand', () => {
    it('should execute learn command with cycles and project path', async () => {
      vi.mocked(execSync).mockReturnValue('Learning complete')

      const result = await ClaudeCommands.runLearnCommand(3, '/test/project')

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('Learning complete')
    })
  })

  describe('takeScreenshot', () => {
    it('should execute screenshot command with URL and name', async () => {
      vi.mocked(execSync).mockReturnValue('Screenshot captured')

      const result = await ClaudeCommands.takeScreenshot('https://example.com', 'test-site')

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('Screenshot captured')
    })
  })

  describe('checkSystemDependencies', () => {
    it('should check all system dependencies in parallel', async () => {
      vi.mocked(execSync)
        .mockReturnValueOnce('v18.0.0') // Node.js
        .mockReturnValueOnce('8.0.0')   // npm
        .mockReturnValueOnce('git version 2.34.0') // Git
        .mockReturnValueOnce('Python 3.9.0') // Python3
        .mockReturnValueOnce('tmux 3.2a') // tmux

      const result = await ClaudeCommands.checkSystemDependencies()

      expect(result.success).toBe(true)
      expect(result.stdout).toContain('Node.js: v18.0.0')
      expect(result.stdout).toContain('npm: 8.0.0')
      expect(result.stdout).toContain('Git: git version 2.34.0')
    })

    it('should handle missing dependencies', async () => {
      vi.mocked(execSync)
        .mockReturnValueOnce('v18.0.0') // Node.js exists
        .mockImplementationOnce(() => { throw new Error('npm not found') }) // npm missing
        .mockReturnValueOnce('git version 2.34.0') // Git exists
        .mockImplementationOnce(() => { throw new Error('python3 not found') }) // Python missing
        .mockImplementationOnce(() => { throw new Error('tmux not found') }) // tmux missing

      const result = await ClaudeCommands.checkSystemDependencies()

      expect(result.success).toBe(false)
      expect(result.stdout).toContain('Node.js: v18.0.0')
      expect(result.stdout).toContain('npm: Not found')
      expect(result.stdout).toContain('Python3: Not found')
    })
  })

  describe('getGitStatus', () => {
    it('should get git status for project', async () => {
      vi.mocked(execSync).mockReturnValue('M file.txt\nA new-file.txt')

      const result = await ClaudeCommands.getGitStatus('/test/project')

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('M file.txt\nA new-file.txt')
    })
  })

  describe('checkGitHealth', () => {
    it('should perform comprehensive git health check', async () => {
      vi.mocked(execSync)
        .mockReturnValueOnce('On branch main\nnothing to commit') // git status
        .mockReturnValueOnce('origin  git@github.com:user/repo.git') // git remote
        .mockReturnValueOnce('abc123 Latest commit') // git log

      const result = await ClaudeCommands.checkGitHealth('/test/project')

      expect(result.success).toBe(true)
      expect(result.stdout).toContain('On branch main')
      expect(result.stdout).toContain('origin  git@github.com')
      expect(result.stdout).toContain('abc123 Latest commit')
    })
  })
})

describe('Command Utilities', () => {
  describe('validateCommand', () => {
    it('should allow safe commands', () => {
      expect(validateCommand('node', ['--version'])).toBe(true)
      expect(validateCommand('npm', ['install'])).toBe(true)
      expect(validateCommand('git', ['status'])).toBe(true)
    })

    it('should reject dangerous commands', () => {
      expect(validateCommand('rm -rf', ['/'])).toBe(false)
      expect(validateCommand('sudo rm', ['file.txt'])).toBe(false)
      expect(validateCommand('format', ['c:'])).toBe(false)
    })

    it('should handle commands without arguments', () => {
      expect(validateCommand('ls')).toBe(true)
      expect(validateCommand('sudo rm')).toBe(false)
    })
  })

  describe('sanitizeCommandArgs', () => {
    it('should remove dangerous characters from arguments', () => {
      const args = ['file.txt', 'path; rm -rf /', 'safe-arg', '$(malicious)']
      const sanitized = sanitizeCommandArgs(args)

      expect(sanitized[0]).toBe('file.txt') // Safe arg unchanged
      expect(sanitized[1]).toBe('path rm -rf /') // Semicolon removed
      expect(sanitized[2]).toBe('safe-arg') // Safe arg unchanged
      expect(sanitized[3]).toBe('malicious') // Dangerous chars removed
    })

    it('should handle empty arguments array', () => {
      const sanitized = sanitizeCommandArgs([])
      expect(sanitized).toEqual([])
    })

    it('should handle arguments with only safe characters', () => {
      const args = ['--version', 'file.txt', '1234']
      const sanitized = sanitizeCommandArgs(args)
      expect(sanitized).toEqual(args)
    })
  })
})

describe('Integration Tests', () => {
  it('should execute complete command workflow', async () => {
    const executor = new CommandExecutor()

    // Mock successful execution
    vi.mocked(execSync).mockReturnValue('Command executed successfully')

    // Test command validation, sanitization, and execution
    const command = 'echo'
    const args = ['hello', 'world']

    expect(validateCommand(command, args)).toBe(true)

    const sanitizedArgs = sanitizeCommandArgs(args)
    expect(sanitizedArgs).toEqual(args)

    const result = executor.executeSync({ command, args: sanitizedArgs })
    expect(result.success).toBe(true)
  })

  it('should handle command execution pipeline', async () => {
    const executor = new CommandExecutor()

    // Test multiple command execution
    vi.mocked(execSync)
      .mockReturnValueOnce('Step 1 complete')
      .mockReturnValueOnce('Step 2 complete')
      .mockReturnValueOnce('Step 3 complete')

    const commands = [
      { command: 'echo', args: ['step 1'] },
      { command: 'echo', args: ['step 2'] },
      { command: 'echo', args: ['step 3'] }
    ]

    const results = await executor.executeSequence(commands)

    expect(results).toHaveLength(3)
    expect(results.every(r => r.success)).toBe(true)
  })
})