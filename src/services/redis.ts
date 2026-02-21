import Redis from 'ioredis';
import { ExcalidrawElement } from '../types/excalidraw';

export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  // Get complete scene state
  async getScene(boardId: string): Promise<ExcalidrawElement[]> {
    const data = await this.redis.get(`board:${boardId}:scene`);
    return data ? JSON.parse(data) : [];
  }

  // Save complete scene state
  async saveScene(boardId: string, elements: ExcalidrawElement[]): Promise<void> {
    await this.redis.setex(`board:${boardId}:scene`, 3600 * 24, JSON.stringify(elements));
  }

  // Add Claude's AI-generated elements
  async addAIElements(boardId: string, elements: ExcalidrawElement[]): Promise<void> {
    const current = await this.getScene(boardId);
    const updated = [...current, ...elements];
    await this.saveScene(boardId, updated);

    // Track AI element IDs for iteration context
    const aiElementIds = elements.map(el => el.id);
    await this.redis.sadd(`board:${boardId}:ai_elements`, ...aiElementIds);
  }

  // Get AI element IDs for context
  async getAIElementIds(boardId: string): Promise<string[]> {
    return await this.redis.smembers(`board:${boardId}:ai_elements`);
  }

  // Clear board state
  async clearBoard(boardId: string): Promise<void> {
    await this.redis.del(`board:${boardId}:scene`);
    await this.redis.del(`board:${boardId}:ai_elements`);
  }
}