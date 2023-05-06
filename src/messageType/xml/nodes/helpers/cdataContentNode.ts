import { CDataNode, Node, TextNode } from "typed-xml";

export function parseCDataContentNode(children: Node[]): string {
  if (children.length !== 1)
    throw new Error("Expected CDataContent-like nodes to have only 1 child");

  const [ cData ] = children;

  if (!(cData instanceof CDataNode))
    throw new Error("Expected CDataContent-like nodes child to be a CDataNode");

  return cData.getContents();
}
