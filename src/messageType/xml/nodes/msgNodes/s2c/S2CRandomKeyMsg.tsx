import { DefaultElement, FragmentElement, Node } from "typed-xml";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class S2CRandomKeyMsg extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected S2CRandomKey <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected S2CRandomKey <body> to have exactly 1 child");

    const [ k ] = children;

    if (!(k instanceof DefaultElement) || k.getName().toLowerCase() !== "k")
      throw new Error("Expected S2CRandomKey <body> child to be a <k> element");

    return new S2CRandomKeyMsg(parseInt(attributes.r), parseTextContentNode(k.getChildren()));
  }

  constructor(
    roomId: number,
    public randomKey: string,
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="rndK" r={this.roomId.toString()}>
        <k>{this.randomKey}</k>
      </body>
    </msg>
  }
}
