"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { MindmapNode } from "./mindmap-node";
import { treeToFlowElements } from "./layout-engine";
import type { MindmapResponse } from "@/lib/types";

const nodeTypes = { mindmapNode: MindmapNode };

interface MindmapViewProps {
  data: MindmapResponse;
}

function getAllNodeIds(node: { id: string; children?: { id: string; children?: unknown[] }[] }): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllNodeIds(child as { id: string; children?: { id: string; children?: unknown[] }[] }));
    }
  }
  return ids;
}

export function MindmapView({ data }: MindmapViewProps) {
  // Start with root and first-level children expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    initial.add(data.root.id);
    for (const child of data.root.children) {
      initial.add(child.id);
    }
    return initial;
  });

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => treeToFlowElements(data.root, expandedNodes),
    [data.root, expandedNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      // Toggle expand/collapse if the node has children
      if (node.data.hasChildren) {
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) {
            next.delete(node.id);
          } else {
            next.add(node.id);
          }
          return next;
        });
      }
    },
    []
  );

  const expandAll = useCallback(() => {
    const allIds = getAllNodeIds(data.root);
    setExpandedNodes(new Set(allIds));
  }, [data.root]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set([data.root.id]));
  }, [data.root.id]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={expandAll}
          className="px-2 py-1 text-xs bg-white border border-zinc-200 rounded hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="px-2 py-1 text-xs bg-white border border-zinc-200 rounded hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
        >
          Collapse all
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
