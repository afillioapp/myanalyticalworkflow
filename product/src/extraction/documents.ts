// Turns a corpus file into plain text. Only text ever reaches the model (rule 12): no file
// is opened by the model itself, and nothing in a file is executed.

import { readFile } from "node:fs/promises";
import { extname } from "node:path";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|[a-z]+);/gi, (m, e: string) =>
      e.startsWith("#") ? String.fromCharCode(Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m),
    )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

export async function loadDocumentText(path: string): Promise<string> {
  const ext = extname(path).toLowerCase();
  if (ext === ".pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(await readFile(path)));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  const raw = await readFile(path, "utf8");
  if (ext === ".html" || ext === ".htm") return htmlToText(raw);
  if (ext === ".md" || ext === ".txt") return raw;
  throw new Error(`unsupported file type: ${ext}. Use .pdf, .html, .md or .txt`);
}
