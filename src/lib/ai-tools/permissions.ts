/**
 * AI Tools Permission System
 * 4-level permission system with role-based access control
 */

import { ToolDefinition, ToolCategory, PermissionLevel, RolePermissions } from './types';

// Role permission configurations
const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'SUPER_ADMIN',
    allowedCategories: [
      ToolCategory.SALES,
      ToolCategory.LEADS,
      ToolCategory.FINANCE,
      ToolCategory.INVENTORY,
      ToolCategory.COMMUNICATION,
      ToolCategory.SYSTEM
    ],
    maxPermissionLevel: PermissionLevel.MANUAL_APPROVAL,
    dailyLimits: {
      aiCalls: 10000,
      toolExecutions: 5000,
      bulkOperations: 500
    }
  },
  {
    role: 'OWNER',
    allowedCategories: [
      ToolCategory.SALES,
      ToolCategory.LEADS,
      ToolCategory.FINANCE,
      ToolCategory.INVENTORY,
      ToolCategory.COMMUNICATION,
      ToolCategory.SYSTEM
    ],
    maxPermissionLevel: PermissionLevel.DOUBLE_CONFIRM,
    dailyLimits: {
      aiCalls: 2000,
      toolExecutions: 1000,
      bulkOperations: 100
    }
  },
  {
    role: 'MANAGER',
    allowedCategories: [
      ToolCategory.SALES,
      ToolCategory.LEADS,
      ToolCategory.FINANCE,
      ToolCategory.INVENTORY,
      ToolCategory.COMMUNICATION
    ],
    maxPermissionLevel: PermissionLevel.CONFIRM,
    dailyLimits: {
      aiCalls: 1000,
      toolExecutions: 500,
      bulkOperations: 50
    }
  },
  {
    role: 'SALES_EXEC',
    allowedCategories: [
      ToolCategory.SALES,
      ToolCategory.LEADS,
      ToolCategory.INVENTORY,
      ToolCategory.COMMUNICATION
    ],
    maxPermissionLevel: PermissionLevel.CONFIRM,
    dailyLimits: {
      aiCalls: 800,
      toolExecutions: 300,
      bulkOperations: 25
    }
  },
  {
    role: 'ACCOUNTANT',
    allowedCategories: [
      ToolCategory.FINANCE,
      ToolCategory.SALES,
      ToolCategory.COMMUNICATION
    ],
    maxPermissionLevel: PermissionLevel.CONFIRM,
    dailyLimits: {
      aiCalls: 600,
      toolExecutions: 250,
      bulkOperations: 20
    }
  },
  {
    role: 'MECHANIC',
    allowedCategories: [
      ToolCategory.INVENTORY // Only service-related tools
    ],
    maxPermissionLevel: PermissionLevel.AUTO,
    dailyLimits: {
      aiCalls: 300,
      toolExecutions: 100,
      bulkOperations: 5
    }
  },
  {
    role: 'VIEWER',
    allowedCategories: [
      ToolCategory.SALES,
      ToolCategory.FINANCE
    ],
    maxPermissionLevel: PermissionLevel.AUTO, // Read-only
    dailyLimits: {
      aiCalls: 200,
      toolExecutions: 50,
      bulkOperations: 0
    }
  }
];

/**
 * Check if user has permission to use a tool
 */
export function checkPermission(tool: ToolDefinition, userRole: string): boolean {
  const rolePermissions = getRolePermissions(userRole);
  
  if (!rolePermissions) {
    console.warn(`Unknown user role: ${userRole}`);
    return false;
  }

  // Check category access
  if (!rolePermissions.allowedCategories.includes(tool.category)) {
    return false;
  }

  // Check permission level
  if (tool.permissionLevel > rolePermissions.maxPermissionLevel) {
    return false;
  }

  return true;
}

/**
 * Get permission level for a tool execution
 */
export function getToolPermissionLevel(tool: ToolDefinition, userRole: string): PermissionLevel | null {
  if (!checkPermission(tool, userRole)) {
    return null;
  }

  return tool.permissionLevel;
}

/**
 * Get user role permissions
 */
export function getRolePermissions(userRole: string): RolePermissions | null {
  return ROLE_PERMISSIONS.find(rp => rp.role === userRole) || null;
}

/**
 * Get allowed categories for a user role
 */
export function getAllowedCategories(userRole: string): ToolCategory[] {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions?.allowedCategories || [];
}

/**
 * Get daily limits for a user role
 */
export function getDailyLimits(userRole: string) {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions?.dailyLimits || {
    aiCalls: 100,
    toolExecutions: 50,
    bulkOperations: 5
  };
}

/**
 * Generate permission messages based on level
 */
export function getPermissionMessage(level: PermissionLevel, toolName: string, params?: any): string {
  switch (level) {
    case PermissionLevel.AUTO:
      return `✅ Executing ${toolName}...`;

    case PermissionLevel.CONFIRM:
      return `⚠️ **Confirmation Required**\n\nTool: ${toolName}\nAction: This will modify data in your system.\n\nType **CONFIRM** to proceed or **CANCEL** to abort.`;

    case PermissionLevel.DOUBLE_CONFIRM:
      const count = params?.count || 'multiple';
      const code = generateConfirmationCode();
      return `🚨 **BULK OPERATION - Double Confirmation Required**\n\nTool: ${toolName}\nRecords affected: ${count}\n\n⚠️ This is a bulk operation that will affect multiple records.\n\nTo proceed, type: **CONFIRM ${code}**\nTo cancel, type: **CANCEL**`;

    case PermissionLevel.MANUAL_APPROVAL:
      return `🔐 **Manual Approval Required**\n\nTool: ${toolName}\nAction: High-risk system operation\n\n❌ This action requires manual approval from dashboard.\n\nPlease go to: **Settings → AI Tools → Pending Approvals**\n\nOr contact your system administrator.`;

    default:
      return `Permission level ${level} not recognized.`;
  }
}

/**
 * Generate random confirmation code for double-confirm operations
 */
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Validate confirmation response
 */
export function validateConfirmation(response: string, expectedCode?: string): boolean {
  const cleanResponse = response.trim().toUpperCase();
  
  if (cleanResponse === 'CANCEL') {
    return false;
  }

  if (cleanResponse === 'CONFIRM' && !expectedCode) {
    return true;
  }

  if (expectedCode && cleanResponse === `CONFIRM ${expectedCode}`) {
    return true;
  }

  return false;
}

/**
 * Check if user can access a specific tool category
 */
export function canAccessCategory(category: ToolCategory, userRole: string): boolean {
  const allowedCategories = getAllowedCategories(userRole);
  return allowedCategories.includes(category);
}

/**
 * Get permission summary for a user role
 */
export function getPermissionSummary(userRole: string) {
  const rolePermissions = getRolePermissions(userRole);
  
  if (!rolePermissions) {
    return {
      role: userRole,
      hasAccess: false,
      error: 'Role not found'
    };
  }

  return {
    role: userRole,
    hasAccess: true,
    allowedCategories: rolePermissions.allowedCategories,
    maxPermissionLevel: rolePermissions.maxPermissionLevel,
    dailyLimits: rolePermissions.dailyLimits,
    permissionLevels: {
      canExecuteImmediately: rolePermissions.maxPermissionLevel >= PermissionLevel.AUTO,
      canConfirm: rolePermissions.maxPermissionLevel >= PermissionLevel.CONFIRM,
      canDoubleConfirm: rolePermissions.maxPermissionLevel >= PermissionLevel.DOUBLE_CONFIRM,
      canManualApproval: rolePermissions.maxPermissionLevel >= PermissionLevel.MANUAL_APPROVAL
    }
  };
}

/**
 * Log permission check for audit
 */
export function logPermissionCheck(toolName: string, userRole: string, allowed: boolean, reason?: string): void {
  console.log(`🔐 Permission Check - Tool: ${toolName}, Role: ${userRole}, Allowed: ${allowed}`, reason ? `Reason: ${reason}` : '');
}