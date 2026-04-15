/**
 * AI Tool Registry - Central router for all AI tools
 * Registers tools, groups by category, and routes user queries
 */

import { ToolDefinition, ToolCategory, ToolRegistry } from './types';

class AIToolRegistry implements ToolRegistry {
  public tools = new Map<string, ToolDefinition>();
  public categorizedTools = new Map<ToolCategory, ToolDefinition[]>();

  constructor() {
    // Initialize empty categories
    Object.values(ToolCategory).forEach(category => {
      this.categorizedTools.set(category, []);
    });
  }

  /**
   * Register a new tool in the registry
   */
  registerTool(tool: ToolDefinition): void {
    // Generate Gemini function declaration
    const requiredParams = Object.entries(tool.parameters)
      .filter(([, schema]) => schema.required)
      .map(([name]) => name);

    tool.functionDeclaration = {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: this.convertToGeminiSchema(tool.parameters),
        required: requiredParams
      }
    };

    // Add to main registry
    this.tools.set(tool.name, tool);

    // Add to category registry
    const categoryTools = this.categorizedTools.get(tool.category) || [];
    categoryTools.push(tool);
    this.categorizedTools.set(tool.category, categoryTools);

    console.log(`✅ Registered AI tool: ${tool.name} (${tool.category})`);
  }

  /**
   * Get all tools in a specific category
   */
  getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return this.categorizedTools.get(category) || [];
  }

  /**
   * Find a specific tool by name
   */
  findTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Analyze user message and determine which tool categories to load
   * This helps optimize function calling by only including relevant tools
   */
  routeQuery(userMessage: string): ToolCategory[] {
    const message = userMessage.toLowerCase();
    const categories: ToolCategory[] = [];

    // Sales keywords (English + Hindi/Hinglish)
    if (this.containsKeywords(message, [
      'sales', 'booking', 'revenue', 'sold', 'delivery', 'payment',
      'invoice', 'customer', 'bike', 'vehicle', 'model', 'gaadi',
      'bikri', 'sell', 'deliver', 'book karo', 'booking karo',
      'payment add', 'paisa', 'amount'
    ])) {
      categories.push(ToolCategory.SALES);
    }

    // Lead keywords (English + Hindi/Hinglish)
    if (this.containsKeywords(message, [
      'lead', 'enquiry', 'followup', 'follow up', 'hot', 'prospect',
      'conversion', 'pipeline', 'contact', 'call', 'naya lead',
      'lead add', 'lead create', 'assign', 'walk-in', 'walkin',
      'enquiry', 'poochtaach', 'customer aaya'
    ])) {
      categories.push(ToolCategory.LEADS);
    }

    // Finance keywords (English + Hindi/Hinglish)
    if (this.containsKeywords(message, [
      'cash', 'money', 'expense', 'daybook', 'balance', 'transaction',
      'profit', 'loss', 'budget', 'financial', 'account', 'kharcha',
      'paisa', 'hisab', 'bill', 'rent', 'salary', 'bijli', 'lock daybook',
      'expense add', 'kharcha add'
    ])) {
      categories.push(ToolCategory.FINANCE);
    }

    // Inventory keywords (English + Hindi/Hinglish)
    if (this.containsKeywords(message, [
      'stock', 'inventory', 'available', 'vehicles', 'models',
      'variants', 'spare', 'parts', 'warehouse', 'gaadi add',
      'vehicle add', 'service', 'job card', 'repair', 'mechanic',
      'marammat'
    ])) {
      categories.push(ToolCategory.INVENTORY);
    }

    // Communication keywords
    if (this.containsKeywords(message, [
      'whatsapp', 'sms', 'email', 'message', 'send', 'notify',
      'alert', 'remind', 'communication', 'template', 'bhejo',
      'msg', 'notification'
    ])) {
      categories.push(ToolCategory.COMMUNICATION);
    }

    // System keywords
    if (this.containsKeywords(message, [
      'system', 'admin', 'user', 'setting', 'configuration',
      'health', 'status', 'report', 'dashboard', 'promotion',
      'offer', 'discount', 'sale offer', 'client', 'tenant',
      'kitne', 'total', 'platform', 'dealership', 'register',
      'blog', 'overview', 'all', 'sab', 'poora'
    ])) {
      categories.push(ToolCategory.SYSTEM);
    }

    // If no specific categories found, include SALES and SYSTEM as defaults
    if (categories.length === 0) {
      categories.push(ToolCategory.SALES, ToolCategory.SYSTEM);
    }

    return categories;
  }

  /**
   * Get all registered tools as Gemini function declarations
   */
  getGeminiFunctionDeclarations(): any[] {
    return Array.from(this.tools.values())
      .map(tool => tool.functionDeclaration)
      .filter(declaration => declaration !== undefined);
  }

  /**
   * Get function declarations for specific categories
   */
  getFunctionDeclarationsByCategories(categories: ToolCategory[]): any[] {
    const declarations: any[] = [];
    
    categories.forEach(category => {
      const tools = this.getToolsByCategory(category);
      tools.forEach(tool => {
        if (tool.functionDeclaration) {
          declarations.push(tool.functionDeclaration);
        }
      });
    });

    return declarations;
  }

  /**
   * Convert parameter schema to Gemini-compatible format
   */
  private convertToGeminiSchema(parameters: { [key: string]: any }): { [key: string]: any } {
    const geminiSchema: { [key: string]: any } = {};

    Object.entries(parameters).forEach(([name, schema]) => {
      geminiSchema[name] = {
        type: schema.type,
        description: schema.description
      };

      if (schema.enum) {
        geminiSchema[name].enum = schema.enum;
      }

      if (schema.items) {
        geminiSchema[name].items = this.convertToGeminiSchema({ item: schema.items }).item;
      }

      if (schema.properties) {
        geminiSchema[name].properties = this.convertToGeminiSchema(schema.properties);
      }
    });

    return geminiSchema;
  }

  /**
   * Check if message contains any of the keywords
   */
  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get registry statistics
   */
  getRegistryStats() {
    const stats = {
      totalTools: this.tools.size,
      categories: {} as { [key: string]: number }
    };

    Object.values(ToolCategory).forEach(category => {
      stats.categories[category] = this.getToolsByCategory(category).length;
    });

    return stats;
  }
}

// Create and export singleton registry
export const toolRegistry = new AIToolRegistry();

// Export convenience functions
export const registerTool = (tool: ToolDefinition) => toolRegistry.registerTool(tool);
export const getToolsByCategory = (category: ToolCategory) => toolRegistry.getToolsByCategory(category);
export const findTool = (name: string) => toolRegistry.findTool(name);
export const routeQuery = (message: string) => toolRegistry.routeQuery(message);
export const getGeminiFunctionDeclarations = () => toolRegistry.getGeminiFunctionDeclarations();
export const getFunctionDeclarationsByCategories = (categories: ToolCategory[]) => 
  toolRegistry.getFunctionDeclarationsByCategories(categories);

export default toolRegistry;