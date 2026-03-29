/**
 * In-Memory Rate Limiter for AI Tools
 * Tracks per-user daily limits for AI calls, messages, and tool executions
 */

import { RateLimitResult, RateLimitConfig } from './types';
import { getDailyLimits } from './permissions';

// In-memory storage for rate limits (will be replaced with Redis in production)
interface UserUsage {
  userId: string;
  date: string; // YYYY-MM-DD format
  aiCalls: number;
  toolExecutions: number;
  bulkOperations: number;
  messages: number;
  lastRequest: Date;
}

// In-memory store
const usageStore = new Map<string, UserUsage>();

// Rate limit configurations
const RATE_LIMITS: { [action: string]: RateLimitConfig } = {
  ai_call: { maxRequests: 500, windowMs: 24 * 60 * 60 * 1000, action: 'ai_call' }, // 500/day
  tool_execution: { maxRequests: 300, windowMs: 24 * 60 * 60 * 1000, action: 'tool_execution' }, // 300/day
  bulk_operation: { maxRequests: 50, windowMs: 24 * 60 * 60 * 1000, action: 'bulk_operation' }, // 50/day
  message: { maxRequests: 1000, windowMs: 24 * 60 * 60 * 1000, action: 'message' }, // 1000/day
};

/**
 * Check if user has remaining quota for an action
 */
export function checkLimit(userId: string, action: string, userRole?: string): RateLimitResult {
  const today = getTodayString();
  const userUsage = getUserUsage(userId, today);
  
  // Get role-based limits if available
  let maxRequests = RATE_LIMITS[action]?.maxRequests || 100;
  if (userRole) {
    const roleLimits = getDailyLimits(userRole);
    switch (action) {
      case 'ai_call':
        maxRequests = roleLimits.aiCalls;
        break;
      case 'tool_execution':
        maxRequests = roleLimits.toolExecutions;
        break;
      case 'bulk_operation':
        maxRequests = roleLimits.bulkOperations;
        break;
    }
  }

  let currentUsage = 0;
  switch (action) {
    case 'ai_call':
      currentUsage = userUsage.aiCalls;
      break;
    case 'tool_execution':
      currentUsage = userUsage.toolExecutions;
      break;
    case 'bulk_operation':
      currentUsage = userUsage.bulkOperations;
      break;
    case 'message':
      currentUsage = userUsage.messages;
      break;
  }

  const remaining = Math.max(0, maxRequests - currentUsage);
  const allowed = currentUsage < maxRequests;

  // Calculate reset time (midnight of next day)
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);

  const result: RateLimitResult = {
    allowed,
    remaining,
    resetTime
  };

  if (!allowed) {
    result.retryAfterMs = resetTime.getTime() - Date.now();
  }

  return result;
}

/**
 * Increment usage counter for a user action
 */
export function incrementUsage(userId: string, action: string): void {
  const today = getTodayString();
  const userUsage = getUserUsage(userId, today);

  switch (action) {
    case 'ai_call':
      userUsage.aiCalls++;
      break;
    case 'tool_execution':
      userUsage.toolExecutions++;
      break;
    case 'bulk_operation':
      userUsage.bulkOperations++;
      break;
    case 'message':
      userUsage.messages++;
      break;
  }

  userUsage.lastRequest = new Date();
  
  // Save back to store
  usageStore.set(getUserKey(userId, today), userUsage);
  
  // Clean up old entries (older than 7 days)
  cleanupOldEntries();
}

/**
 * Get remaining quota for a user
 */
export function getRemainingQuota(userId: string, userRole?: string): {
  aiCalls: number;
  toolExecutions: number;
  bulkOperations: number;
  messages: number;
} {
  const aiCallLimit = checkLimit(userId, 'ai_call', userRole);
  const toolExecutionLimit = checkLimit(userId, 'tool_execution', userRole);
  const bulkOperationLimit = checkLimit(userId, 'bulk_operation', userRole);
  const messageLimit = checkLimit(userId, 'message', userRole);

  return {
    aiCalls: aiCallLimit.remaining,
    toolExecutions: toolExecutionLimit.remaining,
    bulkOperations: bulkOperationLimit.remaining,
    messages: messageLimit.remaining
  };
}

/**
 * Get user usage statistics
 */
export function getUserUsageStats(userId: string): UserUsage | null {
  const today = getTodayString();
  const key = getUserKey(userId, today);
  return usageStore.get(key) || null;
}

/**
 * Reset user limits (admin function)
 */
export function resetUserLimits(userId: string): void {
  const today = getTodayString();
  const key = getUserKey(userId, today);
  usageStore.delete(key);
  console.log(`🔄 Reset rate limits for user: ${userId}`);
}

/**
 * Get all active users with their usage
 */
export function getActiveUsersUsage(): Array<UserUsage & { key: string }> {
  const today = getTodayString();
  const activeUsers: Array<UserUsage & { key: string }> = [];

  usageStore.forEach((usage, key) => {
    if (usage.date === today) {
      activeUsers.push({ ...usage, key });
    }
  });

  return activeUsers.sort((a, b) => b.lastRequest.getTime() - a.lastRequest.getTime());
}

/**
 * Check if rate limit exceeded and return appropriate message
 */
export function checkRateLimitWithMessage(userId: string, action: string, userRole?: string): {
  allowed: boolean;
  message?: string;
  remaining?: number;
} {
  const limitResult = checkLimit(userId, action, userRole);

  if (!limitResult.allowed) {
    const hours = Math.ceil((limitResult.retryAfterMs || 0) / (1000 * 60 * 60));
    return {
      allowed: false,
      message: `🚫 **Rate limit exceeded for ${action}**\n\nYou've reached your daily limit. Resets in ${hours} hours.\n\nUpgrade your plan or contact admin for higher limits.`,
      remaining: 0
    };
  }

  // Warn when getting close to limit
  if (limitResult.remaining <= 10) {
    return {
      allowed: true,
      message: `⚠️ You have ${limitResult.remaining} ${action}s remaining today.`,
      remaining: limitResult.remaining
    };
  }

  return {
    allowed: true,
    remaining: limitResult.remaining
  };
}

// Helper functions

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getUserKey(userId: string, date: string): string {
  return `${userId}:${date}`;
}

function getUserUsage(userId: string, date: string): UserUsage {
  const key = getUserKey(userId, date);
  let usage = usageStore.get(key);

  if (!usage) {
    usage = {
      userId,
      date,
      aiCalls: 0,
      toolExecutions: 0,
      bulkOperations: 0,
      messages: 0,
      lastRequest: new Date()
    };
    usageStore.set(key, usage);
  }

  return usage;
}

function cleanupOldEntries(): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  const cutoffString = cutoffDate.toISOString().split('T')[0];

  let deletedCount = 0;
  usageStore.forEach((usage, key) => {
    if (usage.date < cutoffString) {
      usageStore.delete(key);
      deletedCount++;
    }
  });

  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} old rate limit entries`);
  }
}

// Export rate limiter statistics
export function getRateLimiterStats() {
  const today = getTodayString();
  let activeUsers = 0;
  let totalRequests = 0;

  usageStore.forEach((usage) => {
    if (usage.date === today) {
      activeUsers++;
      totalRequests += usage.aiCalls + usage.toolExecutions + usage.bulkOperations + usage.messages;
    }
  });

  return {
    activeUsers,
    totalRequests,
    memoryUsage: usageStore.size,
    lastCleanup: new Date()
  };
}