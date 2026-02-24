"use client";

import { useAppContext } from "@/context/app-context";

export function LoadingState() {
  const { isLoading, loadingStatus } = useAppContext();

  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {loadingStatus || "Processing..."}
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        This usually takes 15-30 seconds
      </p>
    </div>
  );
}
