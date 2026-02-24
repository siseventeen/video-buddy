"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MindmapFlowNodeData } from "@/lib/types";
import { useAppContext } from "@/context/app-context";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const DEPTH_COLORS = [
  "bg-blue-600 text-white border-blue-700",
  "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700",
  "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-700",
  "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-700",
];

export function MindmapNode({
  data,
}: NodeProps & { data: MindmapFlowNodeData }) {
  const { seekTo } = useAppContext();

  const colorClass = DEPTH_COLORS[data.depth] || DEPTH_COLORS[DEPTH_COLORS.length - 1];

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-w-[140px] max-w-[220px] ${colorClass}`}
      onClick={() => seekTo(data.timestamp)}
      title={data.summary}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-400 !w-2 !h-2" />

      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate">
            {data.label}
          </p>
          {data.depth === 0 && (
            <p className="text-[10px] opacity-70 mt-0.5 line-clamp-2">
              {data.summary}
            </p>
          )}
        </div>
        <span className="text-[10px] font-mono opacity-70 shrink-0 mt-0.5">
          {formatTime(data.timestamp)}
        </span>
      </div>

      {data.hasChildren && (
        <div className="text-[10px] opacity-50 mt-1">
          {data.isExpanded ? "collapse" : "expand"}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-zinc-400 !w-2 !h-2" />
    </div>
  );
}
