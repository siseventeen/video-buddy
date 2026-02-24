import type { TranscriptSegment } from "./types";

export const SYSTEM_PROMPT = `You are a video content analyst. Your job is to analyze video transcripts and produce a hierarchical mindmap structure that captures the key topics, subtopics, and points discussed in the video.

Rules:
1. The mindmap should have 2-4 levels of depth (root -> main topics -> subtopics -> key points).
2. Each node MUST have a "timestamp" field set to the start time (in seconds) of where that topic begins in the video. Use the timestamps from the transcript segments to determine this.
3. Node labels should be concise (2-8 words) — think of them as headings.
4. Node summaries should be 1-2 sentences explaining what is discussed in that section.
5. Aim for 4-8 main topics (children of root) for a typical video. Each main topic can have 2-5 subtopics.
6. The root node's timestamp should be 0.
7. Nodes should be ordered chronologically by timestamp.
8. Do NOT include filler content (introductions like "hey guys welcome back", outros, sponsor segments) as main topics. You may note them briefly if relevant.
9. Every leaf node should correspond to a specific, substantive point made in the video.`;

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function buildUserPrompt(
  transcript: TranscriptSegment[],
  videoTitle?: string
): string {
  const transcriptText = transcript
    .map((seg) => `[${formatTimestamp(seg.startTime)}] ${seg.text}`)
    .join("\n");

  return `${videoTitle ? `Video title: "${videoTitle}"\n\n` : ""}Transcript:
${transcriptText}

Analyze this transcript and produce a hierarchical mindmap. Identify the main topics discussed, group related subtopics, and assign accurate timestamps (in seconds) based on where each topic starts in the transcript above.`;
}

// JSON schema for Claude structured outputs.
// Defined to 4 levels of nesting (recursive schemas not supported).
const nodeSchemaLevel4 = {
  type: "object" as const,
  properties: {
    id: { type: "string" as const },
    label: { type: "string" as const },
    summary: { type: "string" as const },
    timestamp: { type: "number" as const },
    children: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          id: { type: "string" as const },
          label: { type: "string" as const },
          summary: { type: "string" as const },
          timestamp: { type: "number" as const },
          children: { type: "array" as const, items: {} },
        },
        required: ["id", "label", "summary", "timestamp", "children"] as const,
        additionalProperties: false,
      },
    },
  },
  required: ["id", "label", "summary", "timestamp", "children"] as const,
  additionalProperties: false,
};

const nodeSchemaLevel3 = {
  type: "object" as const,
  properties: {
    id: { type: "string" as const },
    label: { type: "string" as const },
    summary: { type: "string" as const },
    timestamp: { type: "number" as const },
    children: { type: "array" as const, items: nodeSchemaLevel4 },
  },
  required: ["id", "label", "summary", "timestamp", "children"] as const,
  additionalProperties: false,
};

const nodeSchemaLevel2 = {
  type: "object" as const,
  properties: {
    id: { type: "string" as const },
    label: { type: "string" as const },
    summary: { type: "string" as const },
    timestamp: { type: "number" as const },
    children: { type: "array" as const, items: nodeSchemaLevel3 },
  },
  required: ["id", "label", "summary", "timestamp", "children"] as const,
  additionalProperties: false,
};

export const MINDMAP_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    root: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const },
        label: { type: "string" as const },
        summary: { type: "string" as const },
        timestamp: { type: "number" as const },
        children: { type: "array" as const, items: nodeSchemaLevel2 },
      },
      required: [
        "id",
        "label",
        "summary",
        "timestamp",
        "children",
      ] as const,
      additionalProperties: false,
    },
  },
  required: ["title", "root"] as const,
  additionalProperties: false,
};
