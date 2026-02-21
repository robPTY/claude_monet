import Anthropic from '@anthropic-ai/sdk';
import { AIResponse, ExcalidrawElement } from '../types/excalidraw';

export class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });
  }

  async generateActions(
    prompt: string,
    imageBuffer: Buffer,
    currentScene: ExcalidrawElement[]
  ): Promise<AIResponse> {
    const systemPrompt = `You are an AI drawing partner for an Excalidraw whiteboard. Your job is to analyze the current canvas and user's request, then return ONLY a JSON response with drawing actions.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no prose.

Current canvas context: The user has drawn ${currentScene.length} elements. Previous AI elements exist and you can iterate on them.

Response format:
{
  "actions": [
    {
      "action": "addShape",
      "element": {
        "type": "rectangle",
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100,
        "strokeColor": "#000000",
        "backgroundColor": "transparent",
        "strokeWidth": 2
      }
    }
  ]
}

Available actions:
- addShape: rectangle, ellipse, diamond (requires: type, x, y, width, height)
- addArrow: lines with optional arrowheads (requires: type="arrow", x, y, points as [[0,0],[100,0]])
- addText: text elements (requires: type="text", x, y, text, fontSize)
- updateElement: modify existing elements (requires: id, plus properties to change)

Default properties if not specified:
- strokeColor: "#000000"
- backgroundColor: "transparent"
- strokeWidth: 2
- fillStyle: "solid"
- fontSize: 20 (for text)

Rules:
1. Analyze the image and user request carefully
2. Position new elements logically relative to existing content
3. Use appropriate colors and sizes
4. Keep actions minimal but effective
5. Return ONLY the JSON, no other text`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBuffer.toString('base64'),
              },
            },
            {
              type: 'text',
              text: `User request: ${prompt}`,
            },
          ],
        },
      ],
    });

    try {
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return JSON.parse(content.text) as AIResponse;
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      throw new Error('Invalid JSON response from Claude API');
    }
  }
}