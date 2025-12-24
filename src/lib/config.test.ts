import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import { ConfigManager } from './config'
import type { ProjectPaths, DevelopmentSettings, SubAgentsConfig } from '@/types'

// Mock fs module
vi.mock('fs')

describe('ConfigManager', () => {
  let configManager: ConfigManager
  const mockConfigDir = '/test/configs'

  beforeEach(() => {
    configManager = new ConfigManager('/test')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getProjectPaths', () => {
    it('should read and parse project paths config', () => {
      const mockConfig: ProjectPaths = {
        projectPaths: {
          'test-project': '/test/path'
        },
        tools: {
          monitoring: {
            script: '/test/script.py',
            commands: { detailed: 'python3 {script}' },
            description: 'Test monitoring'
          },
          screenshot: {
            commands: { capture: 'node script.js' },
            description: 'Test screenshot'
          },
          email: {
            commands: { send: 'npm run email' },
            description: 'Test email'
          },
          messaging: {
            commands: { send: 'bash script.sh' },
            description: 'Test messaging'
          },
          multiModel: {
            commands: { test: 'bash test.sh' },
            description: 'Test multi-model'
          },
          sync: {
            commands: { sync: 'bash sync.sh' },
            description: 'Test sync'
          },
          globalCommands: {
            commands: { learn: 'node learn.js' },
            description: 'Test global commands'
          }
        },
        globalSettings: {
          claudeMdPath: '/test/.claude/CLAUDE.md',
          platform: 'darwin',
          shell: '/bin/bash'
        }
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig))

      const result = configManager.getProjectPaths()

      expect(fs.existsSync).toHaveBeenCalledWith(`${mockConfigDir}/project-paths.json`)
      expect(fs.readFileSync).toHaveBeenCalledWith(`${mockConfigDir}/project-paths.json`, 'utf8')
      expect(result).toEqual(mockConfig)
    })

    it('should return null if config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = configManager.getProjectPaths()

      expect(result).toBeNull()
    })

    it('should return null if JSON parsing fails', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json')

      const result = configManager.getProjectPaths()

      expect(result).toBeNull()
    })
  })

  describe('updateProjectPaths', () => {
    it('should write config to file with proper formatting', () => {
      const mockConfig: ProjectPaths = {
        projectPaths: { 'test': '/test/path' },
        tools: {} as any,
        globalSettings: {} as any
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.writeFileSync).mockImplementation(() => {})

      const result = configManager.updateProjectPaths(mockConfig)

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${mockConfigDir}/project-paths.json`,
        JSON.stringify(mockConfig, null, 2),
        'utf8'
      )
      expect(result).toBe(true)
    })

    it('should create config directory if it does not exist', () => {
      const mockConfig: ProjectPaths = {
        projectPaths: {},
        tools: {} as any,
        globalSettings: {} as any
      }

      vi.mocked(fs.existsSync).mockReturnValue(false)
      vi.mocked(fs.mkdirSync).mockImplementation(() => '')
      vi.mocked(fs.writeFileSync).mockImplementation(() => {})

      const result = configManager.updateProjectPaths(mockConfig)

      expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true })
      expect(result).toBe(true)
    })
  })

  describe('addProjectPath', () => {
    it('should add new project path to existing config', () => {
      const existingConfig: ProjectPaths = {
        projectPaths: { 'existing': '/existing/path' },
        tools: {} as any,
        globalSettings: {} as any
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig))
      vi.mocked(fs.writeFileSync).mockImplementation(() => {})

      const result = configManager.addProjectPath('new-project', '/new/path')

      expect(result).toBe(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${mockConfigDir}/project-paths.json`,
        expect.stringContaining('"new-project": "/new/path"'),
        'utf8'
      )
    })
  })

  describe('validateProjectPaths', () => {
    it('should validate that project paths exist', () => {
      const mockConfig: ProjectPaths = {
        projectPaths: {
          'existing': '/existing/path',
          'missing': '/missing/path'
        },
        tools: {
          monitoring: {
            script: '/existing/script.py',
            commands: { detailed: 'python3 {script}' },
            description: 'Test'
          }
        } as any,
        globalSettings: {} as any
      }

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // config file exists
        .mockReturnValueOnce(true) // existing path exists
        .mockReturnValueOnce(false) // missing path doesn't exist
        .mockReturnValueOnce(true) // script exists

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig))

      const result = configManager.validateProjectPaths()

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Project path not found: missing (/missing/path)')
    })
  })

  describe('runHealthCheck', () => {
    it('should perform comprehensive health check', async () => {
      // Mock all required config files
      vi.mocked(fs.existsSync).mockImplementation((path: string) => {
        return path.includes('.json')
      })

      vi.mocked(fs.readFileSync).mockImplementation((path: string) => {
        if (path.includes('project-paths.json')) {
          return JSON.stringify({
            projectPaths: { 'test': '/test/path' },
            tools: {},
            globalSettings: {}
          })
        }
        if (path.includes('sub-agents.json')) {
          return JSON.stringify({
            subAgents: { 'test-agent': { active: true, projectPath: '/test/path' } },
            integrationConfig: {},
            workflows: {}
          })
        }
        return JSON.stringify({})
      })

      const health = await configManager.runHealthCheck()

      expect(health.score).toBeGreaterThan(0)
      expect(health.status).toBeDefined()
      expect(health.checks).toBeDefined()
      expect(health.timestamp).toBeDefined()
    })
  })

  describe('createBackup', () => {
    it('should create backup of all config files', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.mkdirSync).mockImplementation(() => '')
      vi.mocked(fs.readdirSync).mockReturnValue(['config1.json', 'config2.json'] as any)
      vi.mocked(fs.copyFileSync).mockImplementation(() => {})

      const backupPath = configManager.createBackup()

      expect(backupPath).toBeTruthy()
      expect(fs.mkdirSync).toHaveBeenCalled()
      expect(fs.copyFileSync).toHaveBeenCalledTimes(2)
    })
  })
})

describe('ConfigManager Integration Tests', () => {
  it('should handle complete configuration workflow', () => {
    const configManager = new ConfigManager('/test')

    // Mock file system for a complete workflow
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockImplementation(() => JSON.stringify({
      projectPaths: {},
      tools: {},
      globalSettings: {}
    }))
    vi.mocked(fs.writeFileSync).mockImplementation(() => {})

    // Add project path
    const addResult = configManager.addProjectPath('test-project', '/test/path')
    expect(addResult).toBe(true)

    // Validate configuration
    const validation = configManager.validateProjectPaths()
    expect(validation).toBeDefined()
  })
})