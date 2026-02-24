import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import type { MindmapResponse, TranscriptSegment } from "./types";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

// Gemini uses its own schema format — define the mindmap schema for structured output.
function mindmapNodeSchema(depth: number): Schema {
  const leafNode: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      label: { type: SchemaType.STRING },
      summary: { type: SchemaType.STRING },
      timestamp: { type: SchemaType.NUMBER },
      children: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
    },
    required: ["id", "label", "summary", "timestamp", "children"],
  };

  if (depth <= 0) return leafNode;

  return {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      label: { type: SchemaType.STRING },
      summary: { type: SchemaType.STRING },
      timestamp: { type: SchemaType.NUMBER },
      children: {
        type: SchemaType.ARRAY,
        items: mindmapNodeSchema(depth - 1),
      },
    },
    required: ["id", "label", "summary", "timestamp", "children"],
  };
}

const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    root: mindmapNodeSchema(3),
  },
  required: ["title", "root"],
};

export async function generateMindmapGemini(
  transcript: TranscriptSegment[],
  videoTitle?: string
): Promise<MindmapResponse> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  });

  const result = await model.generateContent(
    buildUserPrompt(transcript, videoTitle)
  );

  const text = result.response.text();
  return JSON.parse(text) as MindmapResponse;
}
