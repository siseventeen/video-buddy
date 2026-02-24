"use client";

import { useState } from "react";
import { useAppContext } from "@/context/app-context";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const { processVideo, isLoading } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    processVideo(trimmed);
  };

  const tryExample = () => {
    const exampleUrl = "https://www.youtube.com/watch?v=aircAruvnKk";
    setUrl(exampleUrl);
    processVideo(exampleUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a YouTube URL..."
        disabled={isLoading}
        className="flex-1 h-11 px-4 rounded-lg border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Processing..." : "Digest"}
      </button>
      {!isLoading && (
        <button
          type="button"
          onClick={tryExample}
          className="h-11 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Try example
        </button>
      )}
    </form>
  );
}
