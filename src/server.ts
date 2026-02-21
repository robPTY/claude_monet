import express from 'express';
import cors from 'cors';
import { MCPClient } from './mcp-client';
import { ClaudeService } from './claude';

const app = express();

app.use(cors());
app.use(express.json());

const mcpClient = new MCPClient();
const claudeService = new ClaudeService(mcpClient);

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