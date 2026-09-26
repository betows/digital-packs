import path from "node:path";

export function getPackPath(filename: string): string {
  return path.join(process.cwd(), "packs", filename);
}
