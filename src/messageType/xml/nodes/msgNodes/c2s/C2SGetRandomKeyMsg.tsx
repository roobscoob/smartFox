import { DefaultElement, FragmentElement, Node } from "typed-xml";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class C2SGetRandomKeyMessage extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected C2SGetRandomKey <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected C2SGetRandomKey <body> to have exactly 0 children");

    return new C2SGetRandomKeyMessage(parseInt(attributes.r));
  }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="rndK" r={this.roomId.toString()}><></></body>
    </msg>
  }
}
