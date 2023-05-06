import { DefaultElement, FragmentElement, Node } from "typed-xml";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class C2SGetBuddyRoomMsg extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected C2SGetBuddyRoom <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected C2SGetBuddyRoom <body> to have exactly 1 child");

    const [ b ] = children;

    if (!(b instanceof DefaultElement) || b.getName().toLowerCase() !== "b")
      throw new Error("Expected C2SGetBuddyRoom <body> child to be a <b> element");

    const buddyId = b.getAttribute("id");

    if (buddyId === undefined)
      throw new Error("Expected C2SGetBuddyRoom <body> <b> to have \"id\" attribute");

    return new C2SGetBuddyRoomMsg(parseInt(attributes.r), parseInt(buddyId));
  }

  constructor(
    roomId: number,
    public buddyId: number,
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="addB" r={this.roomId.toString()}>
        <b id={this.buddyId} />
      </body>
    </msg>
  }
}
