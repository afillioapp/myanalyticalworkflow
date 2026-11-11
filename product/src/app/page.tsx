// P2: the company model as a read-only graph (roadmap.md P2).
import { GraphView } from "@/components/GraphView";
import { loadGraph } from "@/graph/load";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { graph, origin } = await loadGraph();
  const { open } = await searchParams;
  return <GraphView graph={graph} origin={origin} openAll={open === "all"} />;
}
