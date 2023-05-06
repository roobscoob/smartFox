import { DefaultElement, FragmentElement, Node } from "typed-xml";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class C2SCheckVersionMsg extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected C2SCheckVersion <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected C2SCheckVersion <body> to have exactly 1 child");

    const [ ver ] = children;

    if (!(ver instanceof DefaultElement) || ver.getName().toLowerCase() !== "ver")
      throw new Error("Expected C2SCheckVersion <body> child to be a <ver> element");

    const version = ver.getAttribute("v");

    if (version === undefined)
      throw new Error("Expected C2SCheckVersion <body> <ver> to have \"v\" attribute");

    return new C2SCheckVersionMsg(parseInt(attributes.r), parseInt(version));
  }

  constructor(
    roomId: number,
    public version: number,
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="verChk" r={this.roomId.toString()}>
        <ver v={this.version} />
      </body>
    </msg>
  }
}
