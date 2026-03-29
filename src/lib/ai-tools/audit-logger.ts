/**
 * Audit Logger for AI Tools
 * Logs all AI interactions, tool executions, and system actions
 * Currently logs to console, prepared for database logging
 */

import { AuditLogEntry } from './types';

// In-memory audit log (will be replaced with database in production)
const auditLogs: AuditLogEntry[] = [];
const MAX_MEMORY_LOGS = 1000; // Keep last 1000 logs in memory

/**
 * Log an AI tool action or interaction
 */
export function logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const fullEntry: AuditLogEntry = {
    id: generateLogId(),
    timestamp: new Date(),
    ...entry
  };

  // Add to memory store
  auditLogs.unshift(fullEntry);
  
  // Keep only last MAX_MEMORY_LOGS entries
  if (auditLogs.length > MAX_MEMORY_LOGS) {
    auditLogs.splice(MAX_MEMORY_LOGS);
  }

  // Structured console logging
  const logLevel = fullEntry.success ? 'info' : 'error';
  const emoji = getActionEmoji(fullEntry.action);
  
  console.log(`${emoji} [AI-AUDIT] ${fullEntry.action.toUpperCase()}`, {
    id: fullEntry.id,
    timestamp: fullEntry.timestamp.toISOString(),
    tenantId: fullEntry.tenantId,
    userId: fullEntry.userId,
    userRole: fullEntry.userRole,
    toolName: fullEntry.toolName,
    success: fullEntry.success,
    executionTimeMs: fullEntry.executionTimeMs,
    error: fullEntry.errorMessage,
    // Don't log sensitive parameters or results in production
    parameters: process.env.NODE_ENV === 'development' ? fullEntry.parameters : '[REDACTED]',
    result: process.env.NODE_ENV === 'development' ? fullEntry.result : '[REDACTED]'
  });

  // TODO: In production, also log to database
  // await logToDatabase(fullEntry);
}

/**
 * Log successful tool execution
 */
export function logToolSuccess(
  tenantId: string,
  userId: string,
  userRole: string,
  toolName: string,
  parameters: any,
  result: any,
  executionTimeMs: number,
  ipAddress?: string,
  userAgent?: string
): void {
  logAction({
    tenantId,
    userId,
    userRole,
    action: 'tool_execution',
    toolName,
    parameters,
    result,
    success: true,
    executionTimeMs,
    ipAddress,
    userAgent
  });
}

/**
 * Log failed tool execution
 */
export function logToolError(
  tenantId: string,
  userId: string,
  userRole: string,
  toolName: string,
  parameters: any,
  errorMessage: string,
  executionTimeMs?: number,
  ipAddress?: string,
  userAgent?: string
): void {
  logAction({
    tenantId,
    userId,
    userRole,
    action: 'tool_execution',
    toolName,
    parameters,
    success: false,
    errorMessage,
    executionTimeMs,
    ipAddress,
    userAgent
  });
}

/**
 * Log AI chat interaction
 */
export function logAIChat(
  tenantId: string,
  userId: string,
  userRole: string,
  query: string,
  response: any,
  success: boolean,
  executionTimeMs?: number,
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string
): void {
  logAction({
    tenantId,
    userId,
    userRole,
    action: 'ai_chat',
    parameters: { query },
    result: { response },
    success,
    executionTimeMs,
    errorMessage,
    ipAddress,
    userAgent
  });
}

/**
 * Log general system query
 */
export function logQuery(
  tenantId: string,
  userId: string,
  userRole: string,
  queryType: string,
  parameters: any,
  result: any,
  success: boolean,
  executionTimeMs?: number,
  errorMessage?: string
): void {
  logAction({
    tenantId,
    userId,
    userRole,
    action: 'query',
    toolName: queryType,
    parameters,
    result,
    success,
    executionTimeMs,
    errorMessage
  });
}

/**
 * Log system actions (admin/owner only)
 */
export function logSystemAction(
  tenantId: string,
  userId: string,
  userRole: string,
  actionName: string,
  parameters: any,
  result: any,
  success: boolean,
  executionTimeMs?: number,
  errorMessage?: string
): void {
  logAction({
    tenantId,
    userId,
    userRole,
    action: 'system_action',
    toolName: actionName,
    parameters,
    result,
    success,
    executionTimeMs,
    errorMessage
  });
}

/**
 * Get recent logs for a tenant
 */
export function getRecentLogs(tenantId: string, limit: number = 50): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.tenantId === tenantId)
    .slice(0, limit);
}

/**
 * Get recent logs for a specific user
 */
export function getUserLogs(tenantId: string, userId: string, limit: number = 20): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.tenantId === tenantId && log.userId === userId)
    .slice(0, limit);
}

/**
 * Get logs by action type
 */
export function getLogsByAction(tenantId: string, action: string, limit: number = 50): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.tenantId === tenantId && log.action === action)
    .slice(0, limit);
}

/**
 * Get error logs only
 */
export function getErrorLogs(tenantId: string, limit: number = 50): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.tenantId === tenantId && !log.success)
    .slice(0, limit);
}

/**
 * Get audit statistics
 */
export function getAuditStats(tenantId: string, hoursBack: number = 24): {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  topTools: { [toolName: string]: number };
  topUsers: { [userId: string]: number };
  averageExecutionTime: number;
} {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  const relevantLogs = auditLogs.filter(log => 
    log.tenantId === tenantId && log.timestamp >= cutoffTime
  );

  const stats = {
    totalActions: relevantLogs.length,
    successfulActions: relevantLogs.filter(log => log.success).length,
    failedActions: relevantLogs.filter(log => !log.success).length,
    uniqueUsers: new Set(relevantLogs.map(log => log.userId)).size,
    topTools: {} as { [toolName: string]: number },
    topUsers: {} as { [userId: string]: number },
    averageExecutionTime: 0
  };

  // Calculate top tools and users
  relevantLogs.forEach(log => {
    if (log.toolName) {
      stats.topTools[log.toolName] = (stats.topTools[log.toolName] || 0) + 1;
    }
    stats.topUsers[log.userId] = (stats.topUsers[log.userId] || 0) + 1;
  });

  // Calculate average execution time
  const logsWithExecutionTime = relevantLogs.filter(log => log.executionTimeMs);
  if (logsWithExecutionTime.length > 0) {
    stats.averageExecutionTime = logsWithExecutionTime.reduce(
      (sum, log) => sum + (log.executionTimeMs || 0),
      0
    ) / logsWithExecutionTime.length;
  }

  return stats;
}

/**
 * Get system-wide statistics (SUPER_ADMIN only)
 */
export function getSystemWideStats(hoursBack: number = 24): {
  totalTenants: number;
  totalActions: number;
  successRate: number;
  topTenants: { [tenantId: string]: number };
  systemHealth: 'good' | 'warning' | 'critical';
} {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  const relevantLogs = auditLogs.filter(log => log.timestamp >= cutoffTime);

  const uniqueTenants = new Set(relevantLogs.map(log => log.tenantId));
  const successfulActions = relevantLogs.filter(log => log.success).length;
  const totalActions = relevantLogs.length;

  const topTenants: { [tenantId: string]: number } = {};
  relevantLogs.forEach(log => {
    topTenants[log.tenantId] = (topTenants[log.tenantId] || 0) + 1;
  });

  const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 100;
  
  let systemHealth: 'good' | 'warning' | 'critical' = 'good';
  if (successRate < 50) systemHealth = 'critical';
  else if (successRate < 80) systemHealth = 'warning';

  return {
    totalTenants: uniqueTenants.size,
    totalActions,
    successRate,
    topTenants,
    systemHealth
  };
}

/**
 * Clear old logs from memory
 */
export function clearOldLogs(daysBack: number = 7): number {
  const cutoffTime = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const initialCount = auditLogs.length;
  
  // Filter out old logs
  const filteredLogs = auditLogs.filter(log => log.timestamp >= cutoffTime);
  auditLogs.splice(0, auditLogs.length, ...filteredLogs);
  
  const removedCount = initialCount - auditLogs.length;
  console.log(`🧹 Cleared ${removedCount} old audit logs`);
  
  return removedCount;
}

// Helper functions

function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getActionEmoji(action: string): string {
  switch (action) {
    case 'ai_chat':
      return '🤖';
    case 'tool_execution':
      return '🔧';
    case 'query':
      return '🔍';
    case 'system_action':
      return '⚙️';
    default:
      return '📝';
  }
}

// Export memory statistics
export function getAuditLoggerStats() {
  return {
    totalLogsInMemory: auditLogs.length,
    maxMemoryLogs: MAX_MEMORY_LOGS,
    oldestLogTime: auditLogs[auditLogs.length - 1]?.timestamp,
    newestLogTime: auditLogs[0]?.timestamp,
    memoryUsageMb: JSON.stringify(auditLogs).length / (1024 * 1024)
  };
}

// TODO: Database logging functions (for production)
/*
async function logToDatabase(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        id: entry.id,
        tenantId: entry.tenantId,
        userId: entry.userId,
        userRole: entry.userRole,
        timestamp: entry.timestamp,
        action: entry.action,
        toolName: entry.toolName,
        parameters: entry.parameters ? JSON.stringify(entry.parameters) : null,
        result: entry.result ? JSON.stringify(entry.result) : null,
        success: entry.success,
        errorMessage: entry.errorMessage,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        executionTimeMs: entry.executionTimeMs
      }
    });
  } catch (error) {
    console.error('Failed to log audit entry to database:', error);
  }
}
*/