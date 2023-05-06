import { XmlStreamReader, Node } from "typed-xml";
import { ParseContext } from "typed-xml";

export const context = new ParseContext();

export async function parseXml(string: string): Promise<Node> {
  const reader = new XmlStreamReader(true);

  reader.write(string);

  const result = await Node.parse(reader, context);

  if (result instanceof Node)
    return result;

  throw new Error("Node failed to construct");
}

export async function parseAllXml(string: string): Promise<Node[]> {
  const reader = new XmlStreamReader(true);

  reader.write(string);

  let result: Node[] = [];

  while ((reader as any).symbolQueue.length > 0) {
    const parsed = await Node.parse(reader, context);

    if (typeof parsed === "symbol")
      throw new Error("Node failed to construct");

    result.push(parsed);
  }

  return result;
}
