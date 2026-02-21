// Core Excalidraw element types based on MCP spec
export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'arrow' | 'line' | 'text' | 'draw' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid' | 'hachure' | 'cross-hatch' | 'zigzag-line';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  groupIds: string[];
  frameId?: string;
  roundness?: { type: number; value?: number };
  seed: number;
  versionNonce: number;
  isDeleted: boolean;
  boundElements?: { id: string; type: 'arrow' | 'text' }[];
  updated: number;
  link?: string;
  locked: boolean;
}

export interface ExcalidrawTextElement extends ExcalidrawElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  containerId?: string;
  originalText: string;
  lineHeight: number;
}

export interface ExcalidrawArrowElement extends ExcalidrawElement {
  type: 'arrow';
  points: number[][];
  lastCommittedPoint: number[];
  startBinding?: { elementId: string; focus: number; gap: number };
  endBinding?: { elementId: string; focus: number; gap: number };
  startArrowhead: 'arrow' | 'triangle' | 'triangle-outline' | 'bar' | 'dot' | null;
  endArrowhead: 'arrow' | 'triangle' | 'triangle-outline' | 'bar' | 'dot' | null;
}

// Claude API response schema
export interface AIAction {
  action: 'addShape' | 'addArrow' | 'addText' | 'updateElement';
  element: Partial<ExcalidrawElement>;
}

export interface AIResponse {
  explanation: string;
  actions: AIAction[];
}