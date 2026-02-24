"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  MindmapResponse,
  TranscriptSegment,
  ProcessVideoResponse,
} from "@/lib/types";

interface AppState {
  videoId: string | null;
  mindmapData: MindmapResponse | null;
  transcript: TranscriptSegment[];
  isLoading: boolean;
  loadingStatus: string;
  error: string | null;
}

interface AppContextValue extends AppState {
  processVideo: (url: string) => Promise<void>;
  seekTo: (seconds: number) => void;
  setPlayerInstance: (player: YTPlayer) => void;
}

// Minimal type for the YouTube player API methods we use
export interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  getCurrentTime: () => number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    videoId: null,
    mindmapData: null,
    transcript: [],
    isLoading: false,
    loadingStatus: "",
    error: null,
  });

  const playerRef = useRef<YTPlayer | null>(null);

  const setPlayerInstance = useCallback((player: YTPlayer) => {
    playerRef.current = player;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  const processVideo = useCallback(async (url: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingStatus: "Fetching transcript and generating mindmap...",
      error: null,
      mindmapData: null,
      transcript: [],
      videoId: null,
    }));

    try {
      const res = await fetch("/api/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process video");
      }

      const result = data as ProcessVideoResponse;

      setState((prev) => ({
        ...prev,
        videoId: result.videoId,
        mindmapData: result.mindmap,
        transcript: result.transcript,
        isLoading: false,
        loadingStatus: "",
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        loadingStatus: "",
        error: err instanceof Error ? err.message : "An unknown error occurred",
      }));
    }
  }, []);

  return (
    <AppContext.Provider
      value={{ ...state, processVideo, seekTo, setPlayerInstance }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return ctx;
}
