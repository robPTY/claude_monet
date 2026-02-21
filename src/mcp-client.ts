import axios from 'axios';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text?: string;
    name?: string;
    arguments?: any;
  }>;
}

export class MCPClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/mcp`, {
        method: 'tools/list'
      });
      return response.data.tools || [];
    } catch (error) {
      console.error('Failed to list MCP tools:', error);
      return [];
    }
  }

  async callTool(name: string, args: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/mcp`, {
        method: 'tools/call',
        params: {
          name,
          arguments: args
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to call MCP tool ${name}:`, error);
      throw error;
    }
  }

  // Convenience methods for common operations
  async describeScene(): Promise<string> {
    const result = await this.callTool('describe_scene', {});
    return result.content?.[0]?.text || 'Empty canvas';
  }

  async getCanvasScreenshot(): Promise<string> {
    const result = await this.callTool('get_canvas_screenshot', {});
    return result.content?.[0]?.text || '';
  }

  async clearCanvas(): Promise<void> {
    await this.callTool('clear_canvas', {});
  }

  async exportScene(): Promise<any> {
    const result = await this.callTool('export_scene', {});
    return result.content?.[0] || {};
  }

  async createRectangle(x: number, y: number, width: number, height: number, options: any = {}): Promise<void> {
    await this.callTool('create_element', {
      type: 'rectangle',
      x,
      y,
      width,
      height,
      ...options
    });
  }

  async createText(x: number, y: number, text: string, options: any = {}): Promise<void> {
    await this.callTool('create_element', {
      type: 'text',
      x,
      y,
      text,
      ...options
    });
  }

  async createArrow(startX: number, startY: number, endX: number, endY: number, options: any = {}): Promise<void> {
    await this.callTool('create_element', {
      type: 'arrow',
      startX,
      startY,
      endX,
      endY,
      ...options
    });
  }
}