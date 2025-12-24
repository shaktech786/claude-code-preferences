import fs from 'fs'
import path from 'path'
import type {
  ProjectPaths,
  DevelopmentSettings,
  SubAgentsConfig,
  ToolPermissions,
  SystemHealth,
  ConfigUpdate,
  ApiResponse
} from '@/types'

export class ConfigManager {
  private readonly configDir: string
  private readonly rootDir: string

  constructor(rootDir?: string) {
    this.rootDir = rootDir || process.cwd()
    this.configDir = path.join(this.rootDir, 'configs')
  }

  // Generic config file operations
  private readConfigFile<T>(filename: string): T | null {
    try {
      const filePath = path.join(this.configDir, filename)
      if (!fs.existsSync(filePath)) {
        throw new Error(`Config file not found: ${filename}`)
      }

      const content = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(content) as T
    } catch (error) {
      console.error(`Error reading config file ${filename}:`, error)
      return null
    }
  }

  private writeConfigFile<T>(filename: string, data: T): boolean {
    try {
      const filePath = path.join(this.configDir, filename)

      // Ensure config directory exists
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true })
      }

      // Write with proper formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
      return true
    } catch (error) {
      console.error(`Error writing config file ${filename}:`, error)
      return false
    }
  }

  // Project Paths Configuration
  getProjectPaths(): ProjectPaths | null {
    return this.readConfigFile<ProjectPaths>('project-paths.json')
  }

  updateProjectPaths(paths: ProjectPaths): boolean {
    return this.writeConfigFile('project-paths.json', paths)
  }

  addProjectPath(name: string, path: string): boolean {
    const config = this.getProjectPaths()
    if (!config) return false

    config.projectPaths[name] = path
    return this.updateProjectPaths(config)
  }

  removeProjectPath(name: string): boolean {
    const config = this.getProjectPaths()
    if (!config) return false

    delete config.projectPaths[name]
    return this.updateProjectPaths(config)
  }

  // Development Settings Configuration
  getDevelopmentSettings(): DevelopmentSettings | null {
    return this.readConfigFile<DevelopmentSettings>('development-settings.json')
  }

  updateDevelopmentSettings(settings: DevelopmentSettings): boolean {
    return this.writeConfigFile('development-settings.json', settings)
  }

  updateDevelopmentSetting(section: keyof DevelopmentSettings, key: string, value: any): boolean {
    const config = this.getDevelopmentSettings()
    if (!config) return false

    if (typeof config[section] === 'object' && config[section] !== null) {
      (config[section] as any)[key] = value
      return this.updateDevelopmentSettings(config)
    }

    return false
  }

  // Sub-Agents Configuration
  getSubAgentsConfig(): SubAgentsConfig | null {
    return this.readConfigFile<SubAgentsConfig>('sub-agents.json')
  }

  updateSubAgentsConfig(config: SubAgentsConfig): boolean {
    return this.writeConfigFile('sub-agents.json', config)
  }

  toggleSubAgent(agentName: string, active: boolean): boolean {
    const config = this.getSubAgentsConfig()
    if (!config || !config.subAgents[agentName]) return false

    config.subAgents[agentName].active = active
    return this.updateSubAgentsConfig(config)
  }

  updateSubAgentPriority(agentName: string, priority: 'low' | 'medium' | 'high' | 'critical'): boolean {
    const config = this.getSubAgentsConfig()
    if (!config || !config.subAgents[agentName]) return false

    config.subAgents[agentName].priority = priority
    return this.updateSubAgentsConfig(config)
  }

  // Tool Permissions Configuration
  getToolPermissions(): ToolPermissions | null {
    return this.readConfigFile<ToolPermissions>('tool-permissions.json')
  }

  updateToolPermissions(permissions: ToolPermissions): boolean {
    return this.writeConfigFile('tool-permissions.json', permissions)
  }

  addAllowedTool(toolPattern: string): boolean {
    const config = this.getToolPermissions()
    if (!config) return false

    if (!config.allowedWithoutApproval.includes(toolPattern)) {
      config.allowedWithoutApproval.push(toolPattern)
      return this.updateToolPermissions(config)
    }

    return true
  }

  removeAllowedTool(toolPattern: string): boolean {
    const config = this.getToolPermissions()
    if (!config) return false

    config.allowedWithoutApproval = config.allowedWithoutApproval.filter(tool => tool !== toolPattern)
    return this.updateToolPermissions(config)
  }

  // Configuration Validation
  validateProjectPaths(): { valid: boolean; errors: string[] } {
    const config = this.getProjectPaths()
    const errors: string[] = []

    if (!config) {
      return { valid: false, errors: ['Project paths config not found'] }
    }

    // Validate project paths exist
    for (const [name, projectPath] of Object.entries(config.projectPaths)) {
      if (!fs.existsSync(projectPath)) {
        errors.push(`Project path not found: ${name} (${projectPath})`)
      }
    }

    // Validate tool scripts exist
    for (const [toolName, tool] of Object.entries(config.tools)) {
      if (tool.script && !fs.existsSync(tool.script)) {
        errors.push(`Tool script not found: ${toolName} (${tool.script})`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  validateSubAgents(): { valid: boolean; errors: string[] } {
    const config = this.getSubAgentsConfig()
    const errors: string[] = []

    if (!config) {
      return { valid: false, errors: ['Sub-agents config not found'] }
    }

    // Validate sub-agent project paths
    for (const [name, agent] of Object.entries(config.subAgents)) {
      if (agent.projectPath && !fs.existsSync(agent.projectPath)) {
        errors.push(`Sub-agent project path not found: ${name} (${agent.projectPath})`)
      }

      if (agent.commands) {
        for (const [cmdName, cmdValue] of Object.entries(agent.commands)) {
          // Check if command references a file that should exist
          if (cmdValue.includes('/') && cmdValue.startsWith('/')) {
            const scriptPath = cmdValue.split(' ')[1] || cmdValue.split(' ')[0]
            if (!fs.existsSync(scriptPath)) {
              errors.push(`Sub-agent command script not found: ${name}.${cmdName} (${scriptPath})`)
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // Backup and Restore
  createBackup(): string | null {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupDir = path.join(this.rootDir, 'backups', timestamp)

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      // Backup all config files
      const configFiles = fs.readdirSync(this.configDir)
      for (const file of configFiles) {
        if (file.endsWith('.json')) {
          const sourcePath = path.join(this.configDir, file)
          const destPath = path.join(backupDir, file)
          fs.copyFileSync(sourcePath, destPath)
        }
      }

      return backupDir
    } catch (error) {
      console.error('Error creating backup:', error)
      return null
    }
  }

  restoreFromBackup(backupPath: string): boolean {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup directory not found: ${backupPath}`)
      }

      const backupFiles = fs.readdirSync(backupPath)
      for (const file of backupFiles) {
        if (file.endsWith('.json')) {
          const sourcePath = path.join(backupPath, file)
          const destPath = path.join(this.configDir, file)
          fs.copyFileSync(sourcePath, destPath)
        }
      }

      return true
    } catch (error) {
      console.error('Error restoring from backup:', error)
      return false
    }
  }

  // Configuration Change Tracking
  logConfigChange(update: ConfigUpdate): void {
    try {
      const logFile = path.join(this.rootDir, 'config-changes.log')
      const logEntry = `${update.timestamp} - ${update.type}: ${update.path} = ${JSON.stringify(update.value)}\n`

      fs.appendFileSync(logFile, logEntry, 'utf8')
    } catch (error) {
      console.error('Error logging config change:', error)
    }
  }

  // Migration utilities
  migrateConfig(fromVersion: string, toVersion: string): boolean {
    try {
      console.log(`Migrating config from ${fromVersion} to ${toVersion}`)

      // Add version-specific migration logic here
      switch (`${fromVersion}-${toVersion}`) {
        case '1.0.0-1.1.0':
          // Example migration
          this.addDefaultSubAgents()
          break
        default:
          console.log('No migration needed')
      }

      return true
    } catch (error) {
      console.error('Error during config migration:', error)
      return false
    }
  }

  private addDefaultSubAgents(): void {
    const config = this.getSubAgentsConfig()
    if (!config) return

    // Add any new default sub-agents introduced in new versions
    // Implementation would go here
    this.updateSubAgentsConfig(config)
  }

  // Health check for all configurations
  async runHealthCheck(): Promise<SystemHealth> {
    const checks: Record<string, boolean> = {}

    // Check project paths
    const pathValidation = this.validateProjectPaths()
    checks['Project Paths'] = pathValidation.valid

    // Check sub-agents
    const agentsValidation = this.validateSubAgents()
    checks['Sub-Agents'] = agentsValidation.valid

    // Check config files exist
    const requiredConfigs = [
      'project-paths.json',
      'development-settings.json',
      'sub-agents.json',
      'tool-permissions.json'
    ]

    for (const config of requiredConfigs) {
      checks[`Config: ${config}`] = fs.existsSync(path.join(this.configDir, config))
    }

    // Calculate overall score
    const totalChecks = Object.keys(checks).length
    const passedChecks = Object.values(checks).filter(Boolean).length
    const score = Math.round((passedChecks / totalChecks) * 100)

    // Determine status
    let status: SystemHealth['status']
    if (score >= 95) status = 'excellent'
    else if (score >= 80) status = 'good'
    else if (score >= 60) status = 'fair'
    else status = 'poor'

    return {
      score,
      status,
      checks,
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager()

// Utility functions
export function getConfigPath(filename: string): string {
  return path.join(process.cwd(), 'configs', filename)
}

export function ensureConfigDir(): void {
  const configDir = path.join(process.cwd(), 'configs')
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
}

export async function validateAllConfigs(): Promise<ApiResponse<SystemHealth>> {
  try {
    const health = await configManager.runHealthCheck()

    return {
      success: health.score >= 80,
      data: health,
      message: health.score >= 80 ? 'Configuration validation passed' : 'Configuration validation failed'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during validation'
    }
  }
}