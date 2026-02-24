// === Transcript types ===

export interface TranscriptSegment {
  text: string;
  /** Start time in seconds */
  startTime: number;
  /** Duration in seconds */
  duration: number;
}

// === Mindmap types (what Claude returns) ===

export interface MindmapNodeData {
  id: string;
  /** Short label for the node (2-8 words) */
  label: string;
  /** Longer summary of this section (1-2 sentences) */
  summary: string;
  /** Timestamp in seconds where this topic starts in the video */
  timestamp: number;
  /** Child nodes */
  children: MindmapNodeData[];
}

export interface MindmapResponse {
  title: string;
  root: MindmapNodeData;
}

// === React Flow node data ===

export type MindmapFlowNodeData = {
  label: string;
  summary: string;
  timestamp: number;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  [key: string]: unknown;
};

// === API types ===

export interface ProcessVideoRequest {
  url: string;
}

export interface ProcessVideoResponse {
  mindmap: MindmapResponse;
  transcript: TranscriptSegment[];
  videoId: string;
}
