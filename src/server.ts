import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MCPClient } from './mcp-client';
import { ClaudeService } from './claude';
import { ClaudeService as VisionService } from './services/claude';
import { ExcalidrawElement } from './types/excalidraw';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const mcpClient = new MCPClient();
const claudeService = new ClaudeService(mcpClient);
const visionService = new VisionService();

// Main chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await claudeService.processUserMessage(message);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get current canvas state
app.get('/board', async (req, res) => {
  try {
    const scene = await mcpClient.exportScene();
    res.json(scene);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get board state' });
  }
});

// Clear canvas
app.post('/clear', async (req, res) => {
  try {
    await mcpClient.clearCanvas();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear canvas' });
  }
});

// Vision-based AI turn: canvas PNG + prompt → structured drawing actions
// Body: { image: string (base64 PNG), prompt: string, scene?: ExcalidrawElement[] }
app.post('/analyze', async (req, res) => {
  try {
    const { image, prompt, scene } = req.body as {
      image: string;
      prompt: string;
      scene?: ExcalidrawElement[];
    };

    if (!image || !prompt) {
      return res.status(400).json({ error: 'image and prompt are required' });
    }

    const imageBuffer = Buffer.from(image, 'base64');
    const aiResponse = await visionService.generateActions(
      prompt,
      imageBuffer,
      scene ?? []
    );

    res.json(aiResponse);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze canvas' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Chat endpoint: POST http://localhost:${PORT}/chat`);
  console.log(`🎨 Board state: GET http://localhost:${PORT}/board`);
  console.log(`🧹 Clear board: POST http://localhost:${PORT}/clear`);
  console.log(`⚠️  Make sure Excalidraw MCP server is running on ${process.env.MCP_SERVER_URL || 'http://localhost:3001'}`);
});