import { Node, TextNode } from "typed-xml";

export function parseTextContentNode(children: Node[]): string {
  if (children.length !== 1)
    throw new Error("Expected TextContent-like nodes to have only 1 child");

  const [ text ] = children;

  if (!(text instanceof TextNode))
    throw new Error("Expected TextContent-like nodes child to be a TextNode");

  return text.getContents();
}
