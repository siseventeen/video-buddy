import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";
import { generateMindmap } from "@/lib/ai";
import type { ProcessVideoResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A YouTube URL is required." },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please check the link and try again." },
        { status: 400 }
      );
    }

    // Fetch transcript
    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch {
      return NextResponse.json(
        {
          error:
            "Could not fetch the transcript for this video. Make sure the video has captions or subtitles enabled.",
        },
        { status: 422 }
      );
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        { error: "This video has an empty transcript." },
        { status: 422 }
      );
    }

    // Generate mindmap via AI (Claude or Gemini, based on which key is set)
    const mindmap = await generateMindmap(transcript);

    const response: ProcessVideoResponse = {
      mindmap,
      transcript,
      videoId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing video:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the video." },
      { status: 500 }
    );
  }
}
