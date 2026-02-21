  Revised Minimal Plan with Excalidraw-MCP

  Architecture:
  - Express server + excalidraw-mcp as sidecar
  - MCP handles all canvas complexity, we just proxy calls

  Core Flow:
  1. User sends text prompt
  2. Backend uses MCP to get current board state (describe_scene)
  3. Claude API call with current state + user prompt + available MCP tools
  4. Claude returns MCP tool calls (like create_element, add_text, etc.)
  5. Backend executes MCP tool calls
  6. Return response to user

  Files:
  1. src/server.ts - Express with single /chat endpoint
  2. src/mcp-client.ts - Simple MCP client to communicate with excalidraw-mcp server
  3. src/claude.ts - Claude API integration with MCP tools in context

  MCP Integration:
  - Run yctimlin/mcp_excalidraw as Docker sidecar
  - Use their 26 tools: describe_scene, create_element, add_text, add_arrow, etc.
  - No manual Excalidraw element creation - let MCP handle all complexity

  MVP Demo:
  - User: "Draw a flowchart"
  - Claude uses MCP tools: create_element(type: rectangle), add_text(), create_arrow()
  - User: "What's on the board?"
  - Claude uses describe_scene() MCP tool

  This leverages the full power of excalidraw-mcp while keeping our backend minimal - just proxying between user and MCP tools.