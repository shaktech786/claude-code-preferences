// Configuration Types
export interface ProjectPaths {
  projectPaths: Record<string, string>
  tools: {
    monitoring: ToolConfig
    screenshot: ToolConfig
    email: ToolConfig
    messaging: ToolConfig
    multiModel: ToolConfig
    sync: ToolConfig
    globalCommands: ToolConfig
  }
  globalSettings: {
    claudeMdPath: string
    platform: string
    shell: string
  }
}

export interface ToolConfig {
  script?: string
  projectDir?: string
  outputDir?: string
  wrapper?: string
  testScript?: string
  learnScript?: string
  improveScript?: string
  commands: Record<string, string>
  description: string
}

export interface DevelopmentSettings {
  typescript: TypeScriptSettings
  codeStyle: CodeStyleSettings
  git: GitSettings
  testing: TestingSettings
  fileManagement: FileManagementSettings
  security: SecuritySettings
  responseStyle: ResponseStyleSettings
}

export interface TypeScriptSettings {
  enforceStrictMode: boolean
  preferTypeScript: boolean
  lintBeforeCommit: boolean
  typecheckBeforeCommit: boolean
  avoidAnyType: boolean
  followExistingPatterns: boolean
}

export interface CodeStyleSettings {
  addComments: boolean
  preferEditOverCreate: boolean
  followExistingConventions: boolean
  useExistingLibraries: boolean
  maintainConsistentNaming: boolean
}

export interface GitSettings {
  requireExplicitCommitRequest: boolean
  neverAutoCommit: boolean
  alwaysVerifyBeforeCommit: boolean
  includeClaudeSignature: boolean
  signatureText: string
}

export interface TestingSettings {
  alwaysRunTests: boolean
  checkForTestCommands: boolean
  suggestTestCommandsToClaudeMd: boolean
  neverAssumeTestFramework: boolean
}

export interface FileManagementSettings {
  neverCreateUnnecessaryFiles: boolean
  preferEditingExisting: boolean
  neverCreateDocsProactively: boolean
  onlyCreateWhenExplicitlyAsked: boolean
}

export interface SecuritySettings {
  neverExposeSecrets: boolean
  neverLogSensitiveData: boolean
  neverCommitSecrets: boolean
  followSecurityBestPractices: boolean
}

export interface ResponseStyleSettings {
  beADHDFriendly: boolean
  beConcise: boolean
  useVisualSeparators: boolean
  breakComplexTasksIntoChunks: boolean
  avoidUnnecessaryExplanations: boolean
  noEmojisUnlessAsked: boolean
}

// Sub-Agents Types
export interface SubAgentsConfig {
  subAgents: Record<string, SubAgent>
  integrationConfig: IntegrationConfig
  workflows: Record<string, Workflow>
}

export interface SubAgent {
  description: string
  projectPath?: string
  capabilities: string[]
  commands?: Record<string, string>
  configFiles?: string[]
  active: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  specializations?: Record<string, string[]>
  workflow?: string[]
  protocols?: string[]
  supportedModels?: string[]
  supportedProjectTypes?: string[]
  features?: Record<string, string>
  outputFormats?: string[]
}

export interface IntegrationConfig {
  communicationProtocols: string[]
  errorHandling: {
    retryAttempts: number
    fallbackMethods: string[]
    logLevel: string
  }
  monitoring: {
    healthChecks: boolean
    performanceMetrics: boolean
    usageAnalytics: boolean
  }
  security: {
    validateInputs: boolean
    sanitizeOutputs: boolean
    accessControl: string
  }
}

export interface Workflow {
  sequence: string[]
  description: string
}

// Tool Permissions Types
export interface ToolPermissions {
  allowedWithoutApproval: string[]
  requiresApproval: string[]
  serverCredentials?: Record<string, ServerCredential>
}

export interface ServerCredential {
  host: string
  user: string
  note?: string
}

// System Health Types
export interface SystemHealth {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  checks: Record<string, boolean>
  timestamp?: string
  duration?: string
  details?: HealthCheckDetails
}

export interface HealthCheckDetails {
  systemDependencies: DependencyCheck[]
  projectPaths: ProjectPathCheck[]
  toolIntegrations: ToolIntegrationCheck[]
  subAgents: SubAgentCheck[]
}

export interface DependencyCheck {
  name: string
  version?: string
  required: boolean
  status: 'found' | 'missing' | 'outdated'
}

export interface ProjectPathCheck {
  name: string
  path: string
  exists: boolean
  hasPackageJson?: boolean
  lastModified?: string
}

export interface ToolIntegrationCheck {
  name: string
  path: string
  available: boolean
  criticalFiles: string[]
  missingFiles: string[]
}

export interface SubAgentCheck {
  name: string
  active: boolean
  projectPath?: string
  commandsValid: boolean
  capabilitiesCount: number
  priority: string
}

// Monitoring Types
export interface MonitoringReport {
  timestamp: string
  duration: string
  mcp: MCPResult
  gitProgress: Record<string, GitProjectStatus>
  stuckSessions: StuckSession[]
  summary: MonitoringSummary
}

export interface MCPResult {
  success: boolean
  data?: string
  error?: string
}

export interface GitProjectStatus {
  path: string
  latestCommit?: string[]
  uncommittedChanges: number
  currentBranch: string
  lastActivity: string
  error?: string
}

export interface StuckSession {
  session: string
  pattern: string
  content: string
}

export interface MonitoringSummary {
  projectsChecked: number
  stuckPrompts: number
  mcpStatus: 'operational' | 'error'
  overallHealth: 'excellent' | 'needs-attention'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Configuration Update Types
export interface ConfigUpdate {
  type: 'project-paths' | 'development-settings' | 'sub-agents' | 'tool-permissions'
  path: string
  value: any
  timestamp: string
}

// Command Execution Types
export interface CommandExecution {
  command: string
  args?: string[]
  workingDirectory?: string
  timeout?: number
  environment?: Record<string, string>
}

export interface CommandResult {
  success: boolean
  stdout?: string
  stderr?: string
  exitCode?: number
  duration: number
  error?: string
}

// UI State Types
export interface UIState {
  currentPage: string
  loading: boolean
  error?: string
  lastUpdate?: string
}

// Dashboard Types
export interface DashboardStats {
  activeSubAgents: number
  projectIntegrations: number
  configurationFiles: number
  systemHealth: number
}

// Quick Action Types
export interface QuickAction {
  name: string
  description: string
  command: string
  category: 'monitoring' | 'tools' | 'commands'
  color: string
  icon: string
}

// Export all types
export type {
  ProjectPaths,
  ToolConfig,
  DevelopmentSettings,
  SubAgentsConfig,
  SubAgent,
  ToolPermissions,
  SystemHealth,
  MonitoringReport,
  ApiResponse,
  ConfigUpdate,
  CommandExecution,
  CommandResult,
  UIState,
  DashboardStats,
  QuickAction
}