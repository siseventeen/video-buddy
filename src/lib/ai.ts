import type { MindmapResponse, TranscriptSegment } from "./types";

/**
 * Generates a mindmap using whichever AI provider has an API key configured.
 * Priority: ANTHROPIC_API_KEY (Claude) > GEMINI_API_KEY (Gemini).
 */
export async function generateMindmap(
  transcript: TranscriptSegment[],
  videoTitle?: string
): Promise<MindmapResponse> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { generateMindmap: claude } = await import("./claude");
    return claude(transcript, videoTitle);
  }

  if (process.env.GEMINI_API_KEY) {
    const { generateMindmapGemini: gemini } = await import("./gemini");
    return gemini(transcript, videoTitle);
  }

  throw new Error(
    "No AI API key configured. Set either ANTHROPIC_API_KEY or GEMINI_API_KEY in your .env.local file."
  );
}
