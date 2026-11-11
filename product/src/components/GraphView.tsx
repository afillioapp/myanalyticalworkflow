"use client";

// P2 graph view: read-only. Click to select and dim, double-click to zoom into a lane or a
// process, search to find any node. Positions come only from layoutView, never from dragging.

import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";
import { assignLanes } from "@/graph/lanes";
import { layoutView, type Layout } from "@/graph/layout";
import type { Graph } from "@/graph/model";
import { provenance } from "@/graph/provenance";
import { buildView, connectedSet, laneSummaryId, reveal, search, type ViewNode } from "@/graph/view";
import type { Layer } from "@/model/taxonomy";

const LAYERS: Layer[] = ["org", "process", "system", "data", "business", "governance"];
const DEFAULT_LAYERS: Layer[] = ["org", "process", "system"];

type EntityData = { item: ViewNode; dim: boolean; selected: boolean };
type LaneData = { name: string };

function EntityNode({ data }: NodeProps<Node<EntityData>>) {
  const { item, dim, selected } = data;
  const p = provenance(item.node!);
  return (
    <div
      className={`g-node layer-${item.node!.layer} ${p.className}${dim ? " dim" : ""}${selected ? " selected" : ""}`}
      title={p.title}
    >
      <Handle type="target" position={Position.Left} className="g-handle" />
      <div className="g-type">
        {item.node!.type}
        {p.tag && <span className="g-tag">{p.tag}</span>}
      </div>
      <div className="g-name">{item.label}</div>
      {item.expandable && <div className="g-fold">{item.expanded ? "−" : `+${item.folded}`}</div>}
      <Handle type="source" position={Position.Right} className="g-handle" />
    </div>
  );
}

function SummaryNode({ data }: NodeProps<Node<EntityData>>) {
  const { item, dim, selected } = data;
  return (
    <div className={`g-node g-summary${dim ? " dim" : ""}${selected ? " selected" : ""}`} title="Double-click to open">
      <Handle type="target" position={Position.Left} className="g-handle" />
      <div className="g-type">Closed</div>
      <div className="g-name">{item.folded === 1 ? "1 node" : `${item.folded} nodes`}</div>
      <Handle type="source" position={Position.Right} className="g-handle" />
    </div>
  );
}

function LaneNode({ data }: NodeProps<Node<LaneData>>) {
  return (
    <div className="g-lane">
      <span>{data.name}</span>
    </div>
  );
}

const nodeTypes = { entity: EntityNode, summary: SummaryNode, lane: LaneNode };

interface Props {
  graph: Graph;
  origin: "database" | "sample";
  // ?open=all on the URL: every lane and process open, every layer on.
  openAll?: boolean;
}

function Canvas({ graph, origin, openAll }: Props) {
  const [layers, setLayers] = useState(new Set<Layer>(openAll ? LAYERS : DEFAULT_LAYERS));
  const [expandedLanes, setExpandedLanes] = useState(() => new Set<string>(openAll ? assignLanes(graph).lanes.map((l) => l.id) : []));
  const [expandedProcesses, setExpandedProcesses] = useState(
    () => new Set<string>(openAll ? graph.nodes.filter((n) => n.type === "Process").map((n) => n.id) : []),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<Layout | null>(null);
  const flow = useReactFlow();

  const view = useMemo(
    () => buildView(graph, { layers, expandedLanes, expandedProcesses }),
    [graph, layers, expandedLanes, expandedProcesses],
  );

  useEffect(() => {
    let live = true;
    layoutView(view).then((l) => live && setLayout(l));
    return () => {
      live = false;
    };
  }, [view]);

  useEffect(() => {
    if (!layout) return;
    const target = selected && layout.nodes[selected];
    requestAnimationFrame(() =>
      target
        ? flow.setCenter(target.x + target.w / 2, target.y + target.h / 2, { zoom: 1.1, duration: 300 })
        : flow.fitView({ padding: 0.08 }),
    );
    // Recentre only when the picture changes, not on every selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const lit = selected && view.nodes.some((n) => n.id === selected) ? connectedSet(view, selected) : null;

  const nodes: Node[] = useMemo(() => {
    if (!layout) return [];
    const laneNodes: Node[] = view.lanes.map((lane) => ({
      id: `lane:${lane.id}`,
      type: "lane",
      position: { x: layout.lanes[lane.id].x, y: layout.lanes[lane.id].y },
      data: { name: lane.name },
      style: { width: layout.lanes[lane.id].w, height: layout.lanes[lane.id].h },
      draggable: false,
      selectable: false,
      zIndex: -1,
    }));
    const items: Node[] = view.nodes
      .filter((n) => layout.nodes[n.id])
      .map((item) => ({
        id: item.id,
        type: item.kind === "lane-summary" ? "summary" : "entity",
        position: { x: layout.nodes[item.id].x, y: layout.nodes[item.id].y },
        data: { item, dim: lit !== null && !lit.has(item.id), selected: item.id === selected },
        draggable: false,
      }));
    return [...laneNodes, ...items];
  }, [layout, view, lit, selected]);

  const edges: Edge[] = useMemo(
    () =>
      view.edges.map((e) => {
        const dim = lit !== null && !(e.from === selected || e.to === selected);
        return {
          id: e.id,
          source: e.from,
          target: e.to,
          label: e.count > 1 ? `${e.count}` : undefined,
          className: `g-edge${e.handoff ? " handoff" : ""}${dim ? " dim" : ""}`,
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
          data: { title: e.types.join(", ") },
        };
      }),
    [view, lit, selected],
  );

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const openOrClose = (id: string) => {
    const item = view.nodes.find((n) => n.id === id);
    if (!item) return;
    if (item.kind === "lane-summary") setExpandedLanes(toggle(expandedLanes, item.lane));
    else if (item.expandable) setExpandedProcesses(toggle(expandedProcesses, item.id));
  };

  const find = (q: string) => {
    const [hit] = search(graph, q);
    if (!hit) return;
    if (hit.type === "Department") {
      // A department is its lane: show it folded so its summary node can be selected.
      setExpandedLanes(new Set([...expandedLanes].filter((l) => l !== hit.id)));
      setSelected(laneSummaryId(hit.id));
      return;
    }
    const need = reveal(graph, hit.id);
    setLayers(new Set([...layers, hit.layer]));
    setExpandedLanes(new Set([...expandedLanes, ...need.lanes]));
    setExpandedProcesses(new Set([...expandedProcesses, ...need.processes]));
    setSelected(hit.id);
  };

  const selection = view.nodes.find((n) => n.id === selected);
  const handoffs = view.edges.filter((e) => e.handoff).length;

  return (
    <div className="g-shell">
      <header className="g-bar">
        <strong>Company model</strong>
        {origin === "sample" && <span className="g-muted">Sample model</span>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            find(query);
          }}
        >
          <input
            className="g-search"
            placeholder="Find a node"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Find a node by name or type"
          />
        </form>
        <div className="g-layers" role="group" aria-label="Layers">
          {LAYERS.map((layer) => (
            <button
              key={layer}
              type="button"
              className={`g-chip layer-${layer}${layers.has(layer) ? " on" : ""}`}
              aria-pressed={layers.has(layer)}
              onClick={() => setLayers(toggle(layers, layer))}
            >
              {layer}
            </button>
          ))}
        </div>
      </header>
      <div className="g-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_, n) => !n.id.startsWith("lane:") && setSelected(n.id === selected ? null : n.id)}
          onNodeDoubleClick={(_, n) => {
            if (n.id.startsWith("lane:")) setExpandedLanes(toggle(expandedLanes, n.id.slice(5)));
            else openOrClose(n.id);
          }}
          onPaneClick={() => setSelected(null)}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          colorMode="system"
        >
          <Background gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <footer className="g-status">
        {selection ? (
          selection.kind === "lane-summary" ? (
            <span>
              {selection.label} · {selection.folded} nodes · double-click to open
            </span>
          ) : (
            <span>
              {selection.node!.type} · {selection.label} · {selection.node!.source.replace("_", " ")}
              {selection.node!.confidence !== null && ` · confidence ${Math.round(selection.node!.confidence * 100)}%`}
              {selection.node!.verified ? " · confirmed" : " · not confirmed"} · {lit ? lit.size - 1 : 0} connected
              {selection.expandable && " · double-click for steps"}
            </span>
          )
        ) : (
          <span>
            {view.lanes.length} lanes · {handoffs} handoffs · double-click a lane or process to open it
          </span>
        )}
      </footer>
    </div>
  );
}

export function GraphView(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
