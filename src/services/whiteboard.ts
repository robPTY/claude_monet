import { Server } from 'socket.io';
import { RedisService } from './redis';
import { AIResponse, ExcalidrawElement, AIAction } from '../types/excalidraw';
import { generateId } from '../utils/id';

export class WhiteboardService {
  constructor(
    private redis: RedisService,
    private io: Server
  ) {}

  async getScene(boardId: string): Promise<ExcalidrawElement[]> {
    return await this.redis.getScene(boardId);
  }

  async applyActions(boardId: string, aiResponse: AIResponse): Promise<ExcalidrawElement[]> {
    const newElements: ExcalidrawElement[] = [];

    for (const action of aiResponse.actions) {
      const element = await this.processAction(action);
      if (element) {
        newElements.push(element);
      }
    }

    // Add AI elements to Redis
    await this.redis.addAIElements(boardId, newElements);

    // Broadcast to all connected clients
    this.io.to(boardId).emit('ai-elements-added', newElements);

    return await this.getScene(boardId);
  }

  private async processAction(action: AIAction): Promise<ExcalidrawElement | null> {
    const baseElement: Partial<ExcalidrawElement> = {
      id: generateId(),
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      seed: Math.floor(Math.random() * 2147483647),
      versionNonce: Math.floor(Math.random() * 2147483647),
      isDeleted: false,
      updated: Date.now(),
      locked: false,
      ...action.element,
    };

    switch (action.action) {
      case 'addShape':
        return this.createShapeElement(baseElement);

      case 'addArrow':
        return this.createArrowElement(baseElement);

      case 'addText':
        return this.createTextElement(baseElement);

      case 'updateElement':
        // For now, treat as add - updating existing elements requires more logic
        return this.createShapeElement(baseElement);

      default:
        console.warn('Unknown action:', action.action);
        return null;
    }
  }

  private createShapeElement(element: Partial<ExcalidrawElement>): ExcalidrawElement {
    return {
      ...element,
      type: element.type || 'rectangle',
      x: element.x || 0,
      y: element.y || 0,
      width: element.width || 100,
      height: element.height || 100,
    } as ExcalidrawElement;
  }

  private createArrowElement(element: Partial<ExcalidrawElement>): ExcalidrawElement {
    return {
      ...element,
      type: 'arrow',
      x: element.x || 0,
      y: element.y || 0,
      width: element.width || 100,
      height: element.height || 0,
      // Default arrow points: horizontal line
      points: (element as any).points || [[0, 0], [100, 0]],
      lastCommittedPoint: [100, 0],
      startArrowhead: null,
      endArrowhead: 'arrow',
    } as any;
  }

  private createTextElement(element: Partial<ExcalidrawElement>): ExcalidrawElement {
    const text = (element as any).text || 'Text';
    return {
      ...element,
      type: 'text',
      x: element.x || 0,
      y: element.y || 0,
      width: element.width || text.length * 10,
      height: element.height || 25,
      text,
      fontSize: (element as any).fontSize || 20,
      fontFamily: 1,
      textAlign: 'left',
      verticalAlign: 'top',
      originalText: text,
      lineHeight: 1.25,
    } as any;
  }
}