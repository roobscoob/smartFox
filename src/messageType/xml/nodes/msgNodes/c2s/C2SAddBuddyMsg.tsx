import { DefaultElement, FragmentElement, Node } from "typed-xml";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class C2SAddBuddyMessage extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected C2SAddBuddy <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected C2SAddBuddy <body> to have exactly 1 child");

    const [ n ] = children;

    if (!(n instanceof DefaultElement) || n.getName().toLowerCase() !== "n")
      throw new Error("Expected C2SAddBuddy <body> child to be a <n> element");

    const text = parseTextContentNode(n.getChildren());

    return new C2SAddBuddyMessage(parseInt(attributes.r), text);
  }

  constructor(
    roomId: number,
    public buddyName: string,
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="addB" r={this.roomId.toString()}>
        <n>{this.buddyName}</n>
      </body>
    </msg>
  }
}
