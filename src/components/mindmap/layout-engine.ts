import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import type { MindmapNodeData, MindmapFlowNodeData } from "@/lib/types";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;

interface FlatNode {
  id: string;
  data: MindmapFlowNodeData;
  parentId: string | null;
}

/**
 * Recursively flatten the tree into nodes and edges, respecting expanded state.
 */
function flattenTree(
  node: MindmapNodeData,
  parentId: string | null,
  depth: number,
  expandedNodes: Set<string>,
  nodes: FlatNode[],
  edges: Array<{ source: string; target: string }>
) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  nodes.push({
    id: node.id,
    parentId,
    data: {
      label: node.label,
      summary: node.summary,
      timestamp: node.timestamp,
      depth,
      isExpanded,
      hasChildren,
    },
  });

  if (parentId) {
    edges.push({ source: parentId, target: node.id });
  }

  if (hasChildren && isExpanded) {
    for (const child of node.children) {
      flattenTree(child, node.id, depth + 1, expandedNodes, nodes, edges);
    }
  }
}

/**
 * Convert a mindmap tree into positioned React Flow nodes and edges.
 */
export function treeToFlowElements(
  root: MindmapNodeData,
  expandedNodes: Set<string>
): { nodes: Node<MindmapFlowNodeData>[]; edges: Edge[] } {
  const flatNodes: FlatNode[] = [];
  const flatEdges: Array<{ source: string; target: string }> = [];

  flattenTree(root, null, 0, expandedNodes, flatNodes, flatEdges);

  // Create dagre graph for layout
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 30, ranksep: 80 });

  for (const node of flatNodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of flatEdges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const nodes: Node<MindmapFlowNodeData>[] = flatNodes.map((flatNode) => {
    const pos = g.node(flatNode.id);
    return {
      id: flatNode.id,
      type: "mindmapNode",
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      data: flatNode.data,
    };
  });

  const edges: Edge[] = flatEdges.map((e) => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 2 },
  }));

  return { nodes, edges };
}
