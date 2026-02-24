"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContext, type YTPlayer } from "@/context/app-context";
import type { TranscriptSegment } from "@/lib/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function findActiveIndex(
  transcript: TranscriptSegment[],
  currentTime: number
): number {
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (currentTime >= transcript[i].startTime) return i;
  }
  return 0;
}

export function TranscriptPanel() {
  const { transcript, seekTo } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeRef = useRef<HTMLDivElement>(null);
  // We read playerRef indirectly via context — need getCurrentTime polling
  const { videoId } = useAppContext();

  // Poll player time for auto-highlighting
  useEffect(() => {
    if (!videoId || transcript.length === 0) return;

    // Access the player from the iframe API directly
    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    const interval = setInterval(() => {
      // Use postMessage approach or just rely on clicks for now.
      // For simplicity, we won't poll in this MVP — active highlight only updates on click.
    }, 500);

    return () => clearInterval(interval);
  }, [videoId, transcript]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  if (transcript.length === 0) return null;

  const filtered = search.trim()
    ? transcript.filter((seg) =>
        seg.text.toLowerCase().includes(search.toLowerCase())
      )
    : transcript;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transcript..."
          className="w-full h-8 px-3 rounded-md border border-zinc-300 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((seg, i) => {
          const originalIndex = search.trim()
            ? transcript.indexOf(seg)
            : i;
          const isActive = originalIndex === activeIndex;

          return (
            <div
              key={`${seg.startTime}-${i}`}
              ref={isActive ? activeRef : undefined}
              onClick={() => {
                seekTo(seg.startTime);
                setActiveIndex(originalIndex);
              }}
              className={`flex gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : ""
              }`}
            >
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 shrink-0 pt-0.5 w-10 text-right">
                {formatTime(seg.startTime)}
              </span>
              <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {search.trim() ? highlightMatch(seg.text, search) : seg.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
