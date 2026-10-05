import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  ChevronRight,
} from 'lucide-react';
import { COMMUNITIES } from '../data/mockDataGenerator';

interface GraphNode {
  id: string;
  cluster: string;
  communityId: string;
  inDegree: number;
  outDegree: number;
  degreeCentrality: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'reply' | 'repost';
  weight: number;
}

const CLUSTER_COLORS: Record<string, string> = {
  'Cluster-Alpha': '#1e40af', // Deep Blue
  'Cluster-Beta': '#047857', // Forest Emerald
  'Cluster-Gamma': '#b45309', // Ochre Amber
  'Cluster-Delta': '#b91c1c', // Crimson Terracotta
  'Cluster-Epsilon': '#6d28d9', // Subdued Purple
};

export const NetworkGraph: React.FC = () => {
  const { filteredEvents, setSelectedPostForModal, updateFilter } = useData();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Graph state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterCommunity, setFilterCommunity] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Build Graph Topology from filteredEvents
  const { nodes, links, nodeMap } = useMemo(() => {
    const rawNodes = new Map<string, GraphNode>();
    const linkMap = new Map<string, GraphLink>();

    // Index all events by ID to resolve parentEventId -> parent author
    const eventAuthorMap = new Map<string, { authorId: string; communityId: string }>();
    filteredEvents.forEach((ev) => {
      eventAuthorMap.set(ev.id, { authorId: ev.authorId, communityId: ev.communityId });
    });

    // Populate nodes
    filteredEvents.forEach((ev) => {
      if (!rawNodes.has(ev.authorId)) {
        const commId = ev.communityId || 'Cluster-Beta';
        rawNodes.set(ev.authorId, {
          id: ev.authorId,
          cluster: ev.authorCluster,
          communityId: commId,
          inDegree: 0,
          outDegree: 0,
          degreeCentrality: 0,
          x: 0,
          y: 0,
          radius: 5,
          color: CLUSTER_COLORS[commId] || '#64748b',
        });
      }
    });

    // Populate links based on real reply and repost relationships
    filteredEvents.forEach((ev) => {
      if (ev.parentEventId && eventAuthorMap.has(ev.parentEventId)) {
        const parent = eventAuthorMap.get(ev.parentEventId)!;
        const sourceId = ev.authorId;
        const targetId = parent.authorId;

        if (sourceId !== targetId && rawNodes.has(sourceId) && rawNodes.has(targetId)) {
          const linkKey = `${sourceId}->${targetId}`;
          if (!linkMap.has(linkKey)) {
            linkMap.set(linkKey, {
              source: sourceId,
              target: targetId,
              type: ev.relationship === 'repost' ? 'repost' : 'reply',
              weight: 1,
            });
          } else {
            linkMap.get(linkKey)!.weight += 1;
          }

          rawNodes.get(sourceId)!.outDegree += 1;
          rawNodes.get(targetId)!.inDegree += 1;
        }
      }
    });

    // Layout initialization: Arrange clusters circularly
    const nodeArray = Array.from(rawNodes.values());
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const clusterAngles: Record<string, number> = {
      'Cluster-Alpha': 0,
      'Cluster-Beta': (2 * Math.PI) / 5,
      'Cluster-Gamma': (4 * Math.PI) / 5,
      'Cluster-Delta': (6 * Math.PI) / 5,
      'Cluster-Epsilon': (8 * Math.PI) / 5,
    };

    nodeArray.forEach((node, idx) => {
      const baseAngle = clusterAngles[node.communityId] || (idx / nodeArray.length) * 2 * Math.PI;
      const angleVariation = ((idx % 20) - 10) * 0.12;
      const distance = 160 + ((idx % 7) * 20);

      node.x = centerX + Math.cos(baseAngle + angleVariation) * distance;
      node.y = centerY + Math.sin(baseAngle + angleVariation) * distance;

      const totalDegree = node.inDegree + node.outDegree;
      node.degreeCentrality = totalDegree;
      node.radius = Math.min(16, Math.max(5, 5 + totalDegree * 1.2));
    });

    return {
      nodes: nodeArray,
      links: Array.from(linkMap.values()),
      nodeMap: rawNodes,
    };
  }, [filteredEvents]);

  // High connectivity hubs
  const topHubs = useMemo(() => {
    return [...nodes].sort((a, b) => b.degreeCentrality - a.degreeCentrality).slice(0, 8);
  }, [nodes]);

  // Selected node details
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  const selectedNodePosts = useMemo(() => {
    if (!selectedNodeId) return [];
    return filteredEvents.filter((e) => e.authorId === selectedNodeId).slice(0, 10);
  }, [selectedNodeId, filteredEvents]);

  // Canvas Rendering on Clean Light Surface
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Light background fill
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply pan & zoom
      ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 1. Draw Links
      links.forEach((link) => {
        const sourceNode = nodeMap.get(link.source);
        const targetNode = nodeMap.get(link.target);
        if (!sourceNode || !targetNode) return;

        if (
          filterCommunity !== 'all' &&
          sourceNode.communityId !== filterCommunity &&
          targetNode.communityId !== filterCommunity
        ) {
          return;
        }

        const isHighlighted =
          selectedNodeId && (link.source === selectedNodeId || link.target === selectedNodeId);

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = isHighlighted
          ? link.type === 'repost'
            ? '#6d28d9'
            : '#1e40af'
          : link.type === 'repost'
          ? 'rgba(109, 40, 217, 0.25)'
          : 'rgba(100, 116, 139, 0.25)';
        ctx.lineWidth = isHighlighted ? 2.0 : Math.min(2.5, 0.8 + link.weight * 0.3);
        ctx.stroke();
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        if (filterCommunity !== 'all' && node.communityId !== filterCommunity) return;

        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        // Subtle Selection Ring (No loud glowing neon)
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node Label if selected, hovered, or high degree
        if (isSelected || isHovered || node.degreeCentrality >= 10) {
          ctx.font = '500 10px JetBrains Mono, monospace';
          ctx.fillStyle = '#0f172a';
          ctx.fillText(node.id, node.x + node.radius + 4, node.y + 3);
        }
      });

      ctx.restore();
    };

    render();
  }, [nodes, links, nodeMap, selectedNodeId, hoveredNodeId, filterCommunity, zoomLevel, panOffset]);

  // Canvas Click Detection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Inverse transform
    const originX = canvas.width / 2 + panOffset.x;
    const originY = canvas.height / 2 + panOffset.y;
    const worldX = (mouseX - originX) / zoomLevel + canvas.width / 2;
    const worldY = (mouseY - originY) / zoomLevel + canvas.height / 2;

    // Check hit
    let clickedNode: string | null = null;
    for (const node of nodes) {
      if (filterCommunity !== 'all' && node.communityId !== filterCommunity) continue;
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 4) {
        clickedNode = node.id;
        break;
      }
    }

    setSelectedNodeId(clickedNode);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Cross-Platform Network Topology & Information Pathways
          </h2>
          <p className="text-xs text-slate-500">
            Observed interactions, information cascades, and high-connectivity amplification hubs
          </p>
        </div>

        {/* Community Filter & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Filter Cluster:</span>
            <select
              value={filterCommunity}
              onChange={(e) => setFilterCommunity(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">All 5 Clusters</option>
              {COMMUNITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1 text-slate-500 hover:text-slate-900"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="p-1 text-slate-500 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1.0);
                setPanOffset({ x: 0, y: 0 });
                setSelectedNodeId(null);
              }}
              className="p-1 text-slate-500 hover:text-slate-900"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Causality & Inferred vs Observed Relationship Note */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-900">
              Methodological Distinction: Observed Links vs. Inferred Coordination
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Every link displayed represents an <strong>empirically observed</strong> parent-child reply or repost relationship
              extracted directly from post metadata. Network proximity does <strong>not</strong> prove coordinated intent, collusion, or causality.
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Canvas & Hub Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Canvas Viewport */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 text-[10px] font-mono pointer-events-none">
            {COMMUNITIES.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1 rounded bg-white border border-slate-200 px-2 py-0.5 text-slate-700 shadow-xs"
              >
                <span
                  style={{ backgroundColor: CLUSTER_COLORS[c.id] }}
                  className="h-2 w-2 rounded-full"
                />
                {c.id.replace('Cluster-', '')}
              </span>
            ))}
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-3 text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-xs">
            <span className="flex items-center gap-1 text-slate-700">
              <span className="h-0.5 w-3 bg-blue-800" /> Reply Link
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <span className="h-0.5 w-3 bg-purple-700" /> Repost Relay
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={550}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-[500px] cursor-grab active:cursor-grabbing rounded border border-slate-100"
          />

          <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
            Click any node to open the node profile. Click & drag canvas to pan.
          </div>
        </div>

        {/* Right 1 Col: Node Inspector / High Connectivity Hubs */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      Inspecting Node
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">
                      {selectedNode.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-slate-400 hover:text-slate-900"
                  >
                    Close ×
                  </button>
                </div>

                <div className="text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400">Cluster:</span>
                    <span>{selectedNode.communityId}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400">In-Degree (Amplified):</span>
                    <span className="text-emerald-700 font-bold">{selectedNode.inDegree}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400">Out-Degree (Relaying):</span>
                    <span className="text-slate-900 font-bold">{selectedNode.outDegree}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400">Centrality Metric:</span>
                    <span className="text-slate-900 font-bold">{selectedNode.degreeCentrality}</span>
                  </div>
                </div>

                {/* Filter Global Stream Action */}
                <button
                  onClick={() => updateFilter('authorQuery', selectedNode.id)}
                  className="w-full rounded bg-slate-900 hover:bg-slate-800 py-1.5 text-xs font-medium text-white transition-colors"
                >
                  Filter Entire Feed for this Node
                </button>

                {/* Authored Events Feed */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-900 uppercase font-mono tracking-wider mb-2">
                    Authored Posts ({selectedNodePosts.length})
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedNodePosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPostForModal(post)}
                        className="cursor-pointer rounded border border-slate-200 bg-slate-50/50 p-2 text-xs hover:border-slate-300"
                      >
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span className="font-semibold text-slate-900">{post.id}</span>
                          <span>{post.topic}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 line-clamp-2">{post.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Topological Hubs & Relays
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pseudonymous nodes with highest degree centrality in the active network
                  </p>
                </div>

                <div className="space-y-2">
                  {topHubs.map((hub) => (
                    <div
                      key={hub.id}
                      onClick={() => setSelectedNodeId(hub.id)}
                      className="cursor-pointer rounded border border-slate-200 bg-slate-50/50 p-2.5 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-900">{hub.id}</span>
                        <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                          Degree: {hub.degreeCentrality}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{hub.communityId}</span>
                        <span className="text-slate-700 flex items-center gap-0.5 font-medium hover:text-slate-900">
                          Inspect <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
            Nodes: {nodes.length} · Edges: {links.length}
          </div>
        </div>
      </div>
    </div>
  );
};
