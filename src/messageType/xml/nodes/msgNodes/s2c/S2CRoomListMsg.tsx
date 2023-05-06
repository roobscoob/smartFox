import { CDataNode, DefaultElement, FragmentElement, Node } from "typed-xml";
import { RoomVariables } from "../../../../../utils/roomVariables";
import { bt } from "../../helpers/boolTransformer";
import { parseCDataContentNode } from "../../helpers/cdataContentNode";
import { parseTextContentNode } from "../../helpers/textContentNode";
import { C2SMsg } from "../../msg";

export type RoomListRoom = {
  id: number,
  isPrivate: boolean,
  isTemporary: boolean,
  isGame: boolean,
  userCount: number,
  isLimbo: boolean,
  spectatorCount?: number,
  maxUsers: number,
  maxSpectators: number,
  name: string,
  vars: RoomVariables,
}

export class S2CRoomListMsg extends C2SMsg {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (!("r" in attributes))
      throw new Error("Expected S2CRoomList <body> to have a r(oomId) attribute")

    if (children.length !== 1)
      throw new Error("Expected S2CRoomList <body> to have exactly 1 child");

    const [ rmList ] = children;

    if (!(rmList instanceof DefaultElement) || rmList.getName().toLowerCase() !== "rmlist")
      throw new Error("Expected S2CRoomList <body> child to be a <rmList> element");

    const rooms: RoomListRoom[] = [];

    for (const rm of rmList.getChildren()) {
      if (!(rm instanceof DefaultElement) || rm.getName().toLowerCase() !== "rm")
        throw new Error("Expected S2CRoomList <rmList> child to be a <rm> element");

      const id = parseInt(rm.getAttribute("id") ?? "0");
      const isPrivate = rm.getAttribute("isPrivate") === "1";
      const isTemporary = rm.getAttribute("temp") === "1";
      const isGame = rm.getAttribute("isGame") === "1";
      const userCount = parseInt(rm.getAttribute("ucnt") ?? "0");
      const isLimbo = rm.getAttribute("lmb") === "1";

      const scnt = rm.getAttribute("scnt")
      const spectatorCount = scnt ? parseInt(scnt) : undefined;

      const maxUsers = parseInt(rm.getAttribute("maxu") ?? "0");
      const maxSpectators = parseInt(rm.getAttribute("maxs") ?? "0");

      const nameEl = rm.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "n") as DefaultElement | undefined;

      if (nameEl === undefined)
        throw new Error("Expected <rm> elements to have a <n> child");

      const name = parseCDataContentNode(nameEl.getChildren());

      const varsEl = rm.getChildren().find(c => c instanceof DefaultElement && c.getName().toLowerCase() === "vars") as DefaultElement | undefined;

      if (varsEl === undefined)
        throw new Error("Expected <rm> elements to have a <vars> child");

      const [ vars ] = RoomVariables.fromXml(varsEl);

      rooms.push({ id, isPrivate, isTemporary, isGame, userCount, isLimbo, spectatorCount, maxUsers, maxSpectators, name, vars })
    }

    return new S2CRoomListMsg(parseInt(attributes.r), rooms)
  }

  constructor(
    roomId: number,
    public roomList: RoomListRoom[],
  ) { super(roomId) }

  render(): FragmentElement {
    return <msg t="sys">
      <body action="rndK" r={this.roomId.toString()}>
        <rmList>
          {this.roomList.map(room => <rm id={room.id} priv={bt(room.isPrivate)} temp={bt(room.isTemporary)} game={bt(room.isGame)} ucnt={room.userCount} lmb={room.isLimbo} scnt={room.isGame ? room.spectatorCount! : undefined} maxu={room.maxUsers} maxs={room.maxSpectators}>
            <name>{new CDataNode(room.name)}</name>
            {room.vars.render()}
          </rm>)}
        </rmList>
      </body>
    </msg>
  }
}
