import { CDataNode, DefaultElement, FragmentElement, Node } from "typed-xml";
import { RoomVariables } from "../../../../../utils/roomVariables";
import { bt } from "../../helpers/boolTransformer";
import { parseCDataContentNode } from "../../helpers/cdataContentNode";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export class C2SCreateRoomMessage extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected C2SCreateRoom <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected C2SCreateRoom <body> to have exactly 1 child");

    const [ room ] = children;

    if (!(room instanceof DefaultElement) || room.getName().toLowerCase() !== "room")
      throw new Error("Expected C2SCreateRoom <body> child to be a <room> element");

    const isTemporary = room.getAttribute("tmp");
    const isGame = room.getAttribute("gam");
    const maxSpectators = room.getAttribute("spec");
    const exitCurrentRoom = room.getAttribute("exit");
    const joinAsSpectator = room.getAttribute("jas");
    const name = parseCDataContentNode((room.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "name") as DefaultElement | undefined)?.getChildren() ?? []);
    const maxUsers = parseInt(parseTextContentNode((room.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "max") as DefaultElement | undefined)?.getChildren() ?? []));

    const pwdNode = room.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "pwd") as DefaultElement | undefined
    const password = pwdNode ? parseCDataContentNode(pwdNode.getChildren()) : undefined;

    const ucntNode = room.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "ucnt") as DefaultElement | undefined
    const reportUserCount = ucntNode ? parseTextContentNode(ucntNode.getChildren()) === "1" : undefined;

    const xtNode = room.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "ucnt") as DefaultElement | undefined
    const extension = xtNode ? { name: xtNode.getAttribute("n"), script: xtNode.getAttribute("s") } : undefined;

    if (extension !== undefined && (extension.name === undefined || extension.script === undefined))
      throw new Error("Expected n(name) and s(cript) property on <xt> node");

    const varsNode = room.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "vars") as DefaultElement | undefined

    if (varsNode === undefined)
      throw new Error("Expected C2SCreateRoom <body> <room> to contain a <vars>");

    const [ vars ] = RoomVariables.fromXml(varsNode);

    return new C2SCreateRoomMessage(
      parseInt(attributes.r),
      name,
      maxUsers,
      vars,
      password === "" || password === undefined ? undefined : password,
      maxSpectators === undefined || maxSpectators === "" ? undefined : parseInt(maxSpectators),
      isGame === undefined || isGame === "" ? undefined : isGame === "1",
      exitCurrentRoom === undefined || exitCurrentRoom === "" ? undefined : exitCurrentRoom === "1",
      joinAsSpectator === undefined || joinAsSpectator === "" ? undefined : joinAsSpectator === "1",
      reportUserCount,
      extension as { name: string, script: string },
      isTemporary === undefined || isTemporary === "" ? undefined : isTemporary === "1",
    );
  }

  constructor(
    roomId: number,
    public name: string,
    public maxUsers: number,
    public vars: RoomVariables = new RoomVariables,
    public password?: string,
    public maxSpectators?: number,
    public isGame?: boolean,
    public exitCurrentRoom?: boolean,
    public joinAsSpectator?: boolean,
    public broadcastUserCount?: boolean,
    public extension?: { name: string, script: string },
    public isTemporary?: boolean,
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="createRoom" r={this.roomId.toString()}>
        <room tmp={bt(this.isTemporary)} gam={bt(this.isGame)} spec={this.maxSpectators?.toString()} exit={bt(this.exitCurrentRoom)} jas={bt(this.joinAsSpectator)}>
          <name>{new CDataNode(this.name)}</name>
          <pwd>{new CDataNode(this.password ?? "")}</pwd>
          <max>{this.maxUsers}</max>
          {this.broadcastUserCount === undefined ? <></> : <uCnt>{bt(this.broadcastUserCount)}</uCnt>}
          {this.extension === undefined ? <></> : <xt n={this.extension.name} s={this.extension.script} />}
          {this.vars.render()}
        </room>
      </body>
    </msg>
  }
}
