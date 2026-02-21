# Claude Monet - AI Whiteboard Partner

Hackathon MVP: AI draws on Excalidraw canvas using MCP tools.

## Quick Start

1. **Setup environment:**
   ```bash
   cp .env.example .env
   # Add your CLAUDE_API_KEY to .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start MCP server:**
   ```bash
   npm run setup
   # or manually: docker-compose up -d excalidraw-mcp
   ```

4. **Run backend:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /chat` - Send text message, get response or drawing actions
- `GET /board` - Get current canvas state
- `POST /clear` - Clear the canvas
- `GET /health` - Health check

## Example Usage

```bash
# Chat with AI
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Draw a simple flowchart"}'

# Get board state
curl http://localhost:8080/board

# Clear canvas
curl -X POST http://localhost:8080/clear
```

## Architecture

```
Frontend → Express Server → Claude API
                        ↘ MCP Client → Excalidraw MCP Server
```

The AI can either respond with text or execute drawing actions via MCP tools.
