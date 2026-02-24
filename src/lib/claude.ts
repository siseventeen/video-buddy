import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt, MINDMAP_SCHEMA } from "./prompt";
import type { MindmapResponse, TranscriptSegment } from "./types";

const client = new Anthropic();

export async function generateMindmap(
  transcript: TranscriptSegment[],
  videoTitle?: string
): Promise<MindmapResponse> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt(transcript, videoTitle) },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: MINDMAP_SCHEMA,
      },
    },
  });

  const block = response.content[0];
  const text = block.type === "text" ? block.text : "";
  return JSON.parse(text) as MindmapResponse;
}
