import { DefaultElement, FragmentElement, Node } from "typed-xml";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class C2SAutoJoinMessage extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected C2SAutoJoin <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected C2SAutoJoin <body> to have exactly 0 children");

    return new C2SAutoJoinMessage(parseInt(attributes.r));
  }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="autoJoin" r={this.roomId.toString()} />
    </msg>
  }
}
