"use client";

import { useAppContext } from "@/context/app-context";
import { UrlInput } from "@/components/url-input";
import { VideoPlayer } from "@/components/video-player";
import { MindmapView } from "@/components/mindmap/mindmap-view";
import { TranscriptPanel } from "@/components/transcript-panel";
import { LoadingState } from "@/components/loading-state";

export default function Home() {
  const { mindmapData, videoId, isLoading, error } = useAppContext();

  const hasResult = mindmapData && videoId;

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-4 max-w-screen-2xl mx-auto">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
            Video Buddy
          </h1>
          <UrlInput />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && <LoadingState />}

        {!hasResult && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <div className="text-5xl">🎬</div>
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
              Paste a YouTube URL to get started
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              Video Buddy will analyze the video transcript and generate an
              interactive mindmap. Click any node to jump to that part of the
              video.
            </p>
          </div>
        )}

        {hasResult && (
          <div className="flex h-full">
            {/* Left panel — Mindmap */}
            <div className="flex-1 min-w-0 border-r border-zinc-200 dark:border-zinc-800">
              <MindmapView data={mindmapData} />
            </div>

            {/* Right panel — Video + Transcript */}
            <div className="w-[420px] shrink-0 flex flex-col bg-white dark:bg-zinc-950">
              {/* Video player */}
              <div className="shrink-0 p-3 border-b border-zinc-200 dark:border-zinc-800">
                <VideoPlayer />
              </div>

              {/* Transcript */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <TranscriptPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
