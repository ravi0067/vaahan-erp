/**
 * VaahanERP AI Engine API Route
 * New central AI brain with Gemini Function Calling
 * Replaces the old ai-chat endpoint with advanced tool system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-auth';
import { getGeminiApiKeyAsync, getGeminiModel, ensureSettingsLoaded } from '@/lib/credentials';
import { getSystemPrompt } from '@/lib/ai-system-prompt';
import { toolRegistry, routeQuery, getFunctionDeclarationsByCategories } from '@/lib/ai-tools/registry';
import { checkPermission, getPermissionMessage } from '@/lib/ai-tools/permissions';
import { checkRateLimitWithMessage, incrementUsage } from '@/lib/ai-tools/rate-limiter';
import { logAIChat, logToolSuccess, logToolError } from '@/lib/ai-tools/audit-logger';
import { GeminiResponse, GeminiToolCall, ToolCategory } from '@/lib/ai-tools/types';
import { registerAllDataTools } from '@/lib/ai-tools/data-tools';
import { registerAllActionTools } from '@/lib/ai-tools/action-tools';
import { registerAllCommunicationTools } from '@/lib/ai-tools/communication-tools';
import { registerAllDevopsTools } from '@/lib/ai-tools/devops-tools';

export const dynamic = 'force-dynamic';

// Register all tools on module load
let toolsRegistered = false;
function ensureToolsRegistered() {
  if (!toolsRegistered) {
    registerAllDataTools();
    registerAllActionTools();
    registerAllCommunicationTools();
    registerAllDevopsTools();
    toolsRegistered = true;
    console.log('✅ Vaani AI Tools registered (18 data + 14 action + 11 communication + 10 devops = 53 total)');
  }
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    functionCall?: {
      name: string;
      args: { [key: string]: any };
    };
    functionResponse?: {
      name: string;
      response: any;
    };
  }>;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 0. Ensure tools are registered
    ensureToolsRegistered();
    
    // 1. Authentication check
    const { session, error } = await getAuthSession();
    if (error) return error;

    const body = await request.json();
    const { messages, action } = body;
    
    const tenantId = session!.user.tenantId;
    const userId = session!.user.id;
    const userRole = session!.user.role;
    
    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 2. Rate limit check
    const aiCallLimit = checkRateLimitWithMessage(userId, 'ai_call', userRole);
    if (!aiCallLimit.allowed) {
      logAIChat(tenantId, userId, userRole, 'rate_limited', null, false, 
                Date.now() - startTime, aiCallLimit.message, ipAddress, userAgent);
      return NextResponse.json({ 
        response: aiCallLimit.message,
        rateLimit: true 
      }, { status: 429 });
    }

    // 3. Get Gemini API key — DB (AI Config Dashboard) first, then .env fallback
    await ensureSettingsLoaded();
    const geminiApiKey = await getGeminiApiKeyAsync();
    if (!geminiApiKey) {
      logAIChat(tenantId, userId, userRole, 'no_api_key', null, false, 
                Date.now() - startTime, 'Gemini API key not configured', ipAddress, userAgent);
      return NextResponse.json({ 
        response: '⚠️ **AI सेवा उपलब्ध नहीं है**\n\nGemini API key configure नहीं है। Admin से संपर्क करें।',
        configured: false 
      }, { status: 500 });
    }

    // 4. Get the user's latest message for tool routing
    // Limit chat history to last 20 messages to prevent token overflow
    const trimmedMessages = Array.isArray(messages) ? messages.slice(-20) : [];
    const latestMessage = trimmedMessages.length > 0 
      ? trimmedMessages[trimmedMessages.length - 1]?.parts?.[0]?.text || ''
      : '';

    // 5. Route query to determine relevant tool categories
    const relevantCategories = routeQuery(latestMessage);
    console.log(`🎯 Query routing: "${latestMessage}" -> Categories: ${relevantCategories.join(', ')}`);

    // 6. Get function declarations for relevant categories
    const functionDeclarations = getFunctionDeclarationsByCategories(relevantCategories);
    console.log(`🔧 Loaded ${functionDeclarations.length} function declarations`);

    // 7. Build enhanced system prompt
    const baseSystemPrompt = getSystemPrompt(userRole, 'VaahanERP', 'BIKE');
    const toolInstructions = `

## AI TOOL SYSTEM INSTRUCTIONS

You have access to ${functionDeclarations.length} specialized tools for VaahanERP data queries:

**Available Categories:** ${relevantCategories.join(', ')}

**Tool Usage Rules:**
- Use tools to get REAL data from the database instead of making up information
- Always call appropriate tools when users ask for specific data
- Tools are read-only (Level 1 AUTO permission) - they only fetch data, never modify
- Prefer tools over general responses when data is requested
- You can call multiple tools in sequence if needed
- Format responses in Hindi/Hinglish with proper currency formatting (₹X,XX,XXX)

**When to use tools:**
- Dashboard queries: "आज का business", "sales summary", "cash position"
- Lead management: "pending follow-ups", "hot leads", "lead details" 
- Booking queries: "latest bookings", "booking details", "revenue report"
- Financial data: "cash summary", "expense report", "daybook"
- Inventory: "available stock", "inventory status"
- Service: "active jobs", "service status"
- RTO & Documents: "RTO status", "pending applications"

**Response Format:**
- Always respond in Hindi/Hinglish professional tone
- Use proper Indian currency formatting: ₹1,23,456
- Include relevant emojis for better readability
- Keep responses concise but complete
- When showing lists, limit to reasonable numbers (10-20 items max)

Your role: ${userRole} - you have access to categories: ${relevantCategories.join(', ')}
`;

    const enhancedSystemPrompt = baseSystemPrompt + toolInstructions;

    // 8. Prepare Gemini API request with function calling
    const geminiRequestBody: any = {
      system_instruction: {
        parts: [{ text: enhancedSystemPrompt }]
      },
      contents: trimmedMessages.length > 0 ? trimmedMessages : [
        { role: 'user', parts: [{ text: latestMessage }] }
      ]
    };

    // Add function declarations if available
    if (functionDeclarations.length > 0) {
      geminiRequestBody.tools = [
        {
          function_declarations: functionDeclarations
        }
      ];
      geminiRequestBody.tool_config = {
        function_calling_config: {
          mode: 'AUTO'
        }
      };
    }

    // Get model from DB config or default
    const geminiModel = getGeminiModel();
    console.log(`🤖 Calling Gemini API (model: ${geminiModel}) with ${functionDeclarations.length} tools...`);

    // 9. Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody)
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`❌ Gemini HTTP ${geminiResponse.status}:`, errorText);
      logAIChat(tenantId, userId, userRole, latestMessage, null, false, 
                Date.now() - startTime, `HTTP ${geminiResponse.status}: ${errorText}`, ipAddress, userAgent);
      
      // Parse specific error messages
      let userMsg = `❌ AI Error (HTTP ${geminiResponse.status})`;
      try {
        const errJson = JSON.parse(errorText);
        const errDetail = errJson?.error?.message || errorText;
        if (geminiResponse.status === 400) {
          if (errDetail.includes("API_KEY")) {
            userMsg = "❌ **Gemini API Key invalid hai.** Admin se sahi API key set karwao (AI Config Dashboard → AI Brain).";
          } else if (errDetail.includes("token") || errDetail.includes("limit") || errDetail.includes("length")) {
            userMsg = "❌ **Token limit hit ho gayi.** Chhota message bhejo ya admin se model upgrade karwao.";
          } else {
            userMsg = `❌ **Gemini Error:** ${errDetail}`;
          }
        } else if (geminiResponse.status === 429) {
          userMsg = "⏳ **Rate limit!** Thoda wait karo aur phir try karo (1-2 min).";
        } else if (geminiResponse.status === 403) {
          userMsg = "🚫 **API key mein permission nahi hai.** Google AI Studio se key check karo.";
        } else {
          userMsg = `❌ **AI Error:** ${errDetail}`;
        }
      } catch {}
      
      return NextResponse.json({ response: userMsg, error: true }, { status: 500 });
    }

    const geminiData: GeminiResponse = await geminiResponse.json();
    
    if (geminiData.error) {
      logAIChat(tenantId, userId, userRole, latestMessage, null, false, 
                Date.now() - startTime, geminiData.error.message, ipAddress, userAgent);
      return NextResponse.json({ 
        response: `❌ **AI Error:** ${geminiData.error.message}`,
        error: true 
      }, { status: 500 });
    }

    // 10. Process Gemini response and handle function calls
    let finalResponse = '';
    let toolResults: any[] = [];
    
    if (geminiData.candidates && geminiData.candidates[0]) {
      const candidate = geminiData.candidates[0];
      const parts = candidate.content.parts;
      
      // Check if Gemini wants to call functions
      const functionCalls = parts.filter(part => part.functionCall);
      
      if (functionCalls.length > 0) {
        console.log(`🔧 Gemini requested ${functionCalls.length} function calls`);
        
        // Execute function calls
        const functionResponses: any[] = [];
        
        for (const call of functionCalls) {
          const functionCall = call.functionCall!;
          const toolName = functionCall.name;
          const toolArgs = functionCall.args || {};
          
          console.log(`⚡ Executing tool: ${toolName} with args:`, toolArgs);
          
          try {
            // Find and execute the tool
            const tool = toolRegistry.findTool(toolName);
            
            if (!tool) {
              console.error(`❌ Tool not found: ${toolName}`);
              functionResponses.push({
                name: toolName,
                response: { error: 'Tool not found' }
              });
              continue;
            }

            // Check permissions
            if (!checkPermission(tool, userRole)) {
              console.error(`🚫 Permission denied for tool: ${toolName}, role: ${userRole}`);
              functionResponses.push({
                name: toolName,
                response: { error: 'Permission denied' }
              });
              continue;
            }

            // Execute tool
            const toolStartTime = Date.now();
            const toolResult = await tool.handler(toolArgs, tenantId, userRole);
            const toolExecutionTime = Date.now() - toolStartTime;
            
            toolResults.push({
              toolName,
              args: toolArgs,
              result: toolResult,
              executionTime: toolExecutionTime
            });

            if (toolResult.success) {
              logToolSuccess(tenantId, userId, userRole, toolName, toolArgs, 
                           toolResult, toolExecutionTime, ipAddress, userAgent);
              
              functionResponses.push({
                name: toolName,
                response: toolResult.data || toolResult.message
              });
              
              // Increment tool execution count
              incrementUsage(userId, 'tool_execution');
            } else {
              logToolError(tenantId, userId, userRole, toolName, toolArgs, 
                         toolResult.error || 'Tool execution failed', toolExecutionTime, ipAddress, userAgent);
              
              functionResponses.push({
                name: toolName,
                response: { error: toolResult.error || 'Tool execution failed' }
              });
            }
          } catch (toolError: any) {
            console.error(`❌ Tool execution error: ${toolName}`, toolError);
            logToolError(tenantId, userId, userRole, toolName, toolArgs, 
                       toolError.message, Date.now() - Date.now(), ipAddress, userAgent);
            
            functionResponses.push({
              name: toolName,
              response: { error: toolError.message }
            });
          }
        }

        // Send function results back to Gemini for final response
        const followUpMessages = [...trimmedMessages];
        
        // Add the function call
        followUpMessages.push({
          role: 'model',
          parts: functionCalls
        });
        
        // Add function responses
        followUpMessages.push({
          role: 'user',
          parts: functionResponses.map(fr => ({
            functionResponse: fr
          }))
        });

        console.log(`🔄 Sending function results back to Gemini...`);

        // Call Gemini again with function results
        const followUpRequest = {
          system_instruction: {
            parts: [{ text: enhancedSystemPrompt }]
          },
          contents: followUpMessages
        };

        const followUpResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(followUpRequest)
          }
        );

        const followUpData: GeminiResponse = await followUpResponse.json();
        
        if (followUpData.candidates && followUpData.candidates[0]) {
          const textParts = followUpData.candidates[0].content.parts.filter(p => p.text);
          finalResponse = textParts.map(p => p.text).join('');
        } else {
          finalResponse = 'Function calls executed successfully but no response generated.';
        }

      } else {
        // No function calls, just return text response
        const textParts = parts.filter(part => part.text);
        finalResponse = textParts.map(part => part.text).join('');
      }
    }

    if (!finalResponse) {
      finalResponse = 'Sorry, I couldn\'t generate a response. Please try again.';
    }

    // 11. Increment usage and log successful interaction
    incrementUsage(userId, 'ai_call');
    
    const executionTime = Date.now() - startTime;
    logAIChat(tenantId, userId, userRole, latestMessage, { 
      response: finalResponse, 
      toolsUsed: toolResults.length,
      executionTime
    }, true, executionTime, undefined, ipAddress, userAgent);

    // 12. Return final response
    return NextResponse.json({
      response: finalResponse,
      toolsExecuted: toolResults.length,
      executionTime,
      timestamp: new Date().toISOString(),
      metadata: {
        toolResults: toolResults.map(tr => ({
          tool: tr.toolName,
          success: tr.result.success,
          executionTime: tr.executionTime
        }))
      }
    });

  } catch (error: any) {
    console.error('AI Engine Error:', error);
    
    const executionTime = Date.now() - startTime;
    
    // Log error if we have session info
    try {
      const { session } = await getAuthSession();
      if (session) {
        logAIChat(session.user.tenantId, session.user.id, session.user.role, 
                  'error', null, false, executionTime, error.message);
      }
    } catch (logError) {
      console.error('Failed to log AI engine error:', logError);
    }

    return NextResponse.json({
      response: '❌ **AI Engine Error**\n\nकुछ गलत हुआ है। कृपया फिर से कोशिश करें।\n\nअगर समस्या बनी रहे तो admin से संपर्क करें।',
      error: error.message,
      executionTime
    }, { status: 500 });
  }
}