import Anthropic from '@anthropic-ai/sdk';
import { MCPClient } from './mcp-client';

export interface ChatResponse {
  type: 'text' | 'actions';
  content?: string;
  actions?: Array<{
    tool: string;
    args: any;
  }>;
}

export class ClaudeService {
  private anthropic: Anthropic;
  private mcpClient: MCPClient;

  constructor(mcpClient: MCPClient) {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });
    this.mcpClient = mcpClient;
  }

  async processUserMessage(message: string): Promise<ChatResponse> {
    // Get current canvas state
    const sceneDescription = await this.mcpClient.describeScene();

    const systemPrompt = `You are an AI drawing partner for an Excalidraw whiteboard. You can either:
1. Respond with text to answer questions or provide guidance
2. Create drawing actions using available MCP tools

Current canvas: ${sceneDescription}

Available MCP tools:
- create_element: Create rectangles, ellipses, diamonds, text, arrows
- clear_canvas: Clear the entire canvas
- describe_scene: Get description of current canvas
- get_canvas_screenshot: Get visual representation

When the user wants you to draw something, respond with actions. Otherwise, respond with helpful text.

Response format for actions:
{
  "type": "actions",
  "actions": [
    {"tool": "create_element", "args": {"type": "rectangle", "x": 100, "y": 100, "width": 200, "height": 100}},
    {"tool": "create_element", "args": {"type": "text", "x": 150, "y": 140, "text": "Hello"}}
  ]
}

Response format for text:
{
  "type": "text",
  "content": "Your helpful response here"
}

IMPORTANT: Return only valid JSON, no other text.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const parsed = JSON.parse(content.text) as ChatResponse;

      // Execute actions if provided
      if (parsed.type === 'actions' && parsed.actions) {
        await this.executeActions(parsed.actions);
      }

      return parsed;
    } catch (error) {
      console.error('Claude API error:', error);
      return {
        type: 'text',
        content: 'Sorry, I encountered an error processing your request.'
      };
    }
  }

  private async executeActions(actions: Array<{ tool: string; args: any }>): Promise<void> {
    for (const action of actions) {
      try {
        await this.mcpClient.callTool(action.tool, action.args);
      } catch (error) {
        console.error(`Failed to execute action ${action.tool}:`, error);
      }
    }
  }
}