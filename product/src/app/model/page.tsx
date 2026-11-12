// The company model as a read-only graph (P2). It shows the current workspace, so every
// sign-off appears here.
import { GraphView } from "@/components/GraphView";
import { loadGraph } from "@/graph/load";

export const dynamic = "force-dynamic";

export default async function ModelPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { graph, origin } = await loadGraph();
  const { open } = await searchParams;
  return <GraphView graph={graph} origin={origin} openAll={open === "all"} />;
}
