/**
 * TypeScript types for VaahanERP AI Tool System
 * Defines the structure for tools, permissions, results, and audit logs
 */

// Tool Categories - organize tools by business function
export enum ToolCategory {
  SALES = 'SALES',
  LEADS = 'LEADS', 
  FINANCE = 'FINANCE',
  INVENTORY = 'INVENTORY',
  COMMUNICATION = 'COMMUNICATION',
  SYSTEM = 'SYSTEM'
}

// Permission Levels - 4-tier system for tool execution
export enum PermissionLevel {
  AUTO = 1,           // Execute immediately (read-only queries)
  CONFIRM = 2,        // Show confirmation prompt (create/update)
  DOUBLE_CONFIRM = 3, // Show count + confirmation code (bulk actions)
  MANUAL_APPROVAL = 4 // Require manual dashboard action (deploy/delete)
}

// Parameter schema for tool validation
export interface ParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: string[];
  items?: ParameterSchema; // for arrays
  properties?: { [key: string]: ParameterSchema }; // for objects
}

// Tool definition structure
export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  permissionLevel: PermissionLevel;
  parameters: { [key: string]: ParameterSchema };
  handler: (params: any, tenantId: string, userRole: string) => Promise<ToolResult>;
  // Gemini function declaration (auto-generated from above)
  functionDeclaration?: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: { [key: string]: any };
      required: string[];
    };
  };
}

// Tool execution result
export interface ToolResult {
  success: boolean;
  data?: any;
  message: string;
  requiresConfirmation?: boolean;
  confirmationCode?: string;
  count?: number; // for bulk operations
  error?: string;
  metadata?: {
    executionTime?: number;
    recordsAffected?: number;
    [key: string]: any;
  };
}

// Audit log entry for tracking all AI interactions
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userRole: string;
  timestamp: Date;
  action: 'query' | 'tool_execution' | 'ai_chat' | 'system_action';
  toolName?: string;
  parameters?: any;
  result?: any;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  executionTimeMs?: number;
}

// Rate limiting types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  action: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfterMs?: number;
}

// Tool registry types
export interface ToolRegistry {
  tools: Map<string, ToolDefinition>;
  categorizedTools: Map<ToolCategory, ToolDefinition[]>;
  registerTool: (tool: ToolDefinition) => void;
  getToolsByCategory: (category: ToolCategory) => ToolDefinition[];
  findTool: (name: string) => ToolDefinition | undefined;
  routeQuery: (userMessage: string) => ToolCategory[];
}

// User role permissions mapping
export interface RolePermissions {
  role: string;
  allowedCategories: ToolCategory[];
  maxPermissionLevel: PermissionLevel;
  dailyLimits: {
    aiCalls: number;
    toolExecutions: number;
    bulkOperations: number;
  };
}

// System health check result
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: boolean;
    gemini: boolean;
    supabase: boolean;
    externalApis: boolean;
  };
  metrics: {
    responseTimeMs: number;
    memoryUsageMb: number;
    activeConnections: number;
  };
  lastChecked: Date;
}

// Function calling types for Gemini API
export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: { [key: string]: any };
    required: string[];
  };
}

export interface GeminiToolCall {
  functionCall: {
    name: string;
    args: { [key: string]: any };
  };
}

export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        functionCall?: {
          name: string;
          args: { [key: string]: any };
        };
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message: string;
    code?: number;
  };
}