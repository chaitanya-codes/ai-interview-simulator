import { extractText } from "unpdf";

export async function parseResume(buffer: Buffer): Promise<string> {
  const result = await extractText(new Uint8Array(buffer));
  return result.text.join("\n");
}