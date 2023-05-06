import { FragmentElement, Node } from "typed-xml";
import { S2CMsg } from "../../msg";

export class S2CApiVersionKoMsg extends S2CMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected S2CApiVersionKo <body> to have a r(oomId) attribute")

    if (children.length !== 0)
      throw new Error("Expected S2CApiVersionKo <body> to have exactly 0 children");

    return new S2CApiVersionKoMsg(parseInt(attributes.r));
  }

  constructor(
    roomId: number,
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="apiKO" r={this.roomId.toString()} />
    </msg>
  }
}
