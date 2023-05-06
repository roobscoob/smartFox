import { ConnectionFailureError } from "./socket/connectionFailure";
import { TlsClient } from "./socket/tls/client";
import { TcpClient } from "./socket/tcp/client";
import { ClientSocket, JsonValue } from "./socket/socket";
import type tls from "node:tls";
import { C2SCheckVersionMsg } from "./messageType/xml/nodes/msgNodes/c2s/C2SCheckVersionMsg";
import { S2CApiVersionOkMsg } from "./messageType/xml/nodes/msgNodes/s2c/S2CApiVersionOkMsg";
import { S2CApiVersionKoMsg } from "./messageType/xml/nodes/msgNodes/s2c/S2CApiVersionKoMsg";
import { C2SGetRandomKeyMessage } from "./messageType/xml/nodes/msgNodes/c2s/C2SGetRandomKeyMsg";
import { S2CRandomKeyMsg } from "./messageType/xml/nodes/msgNodes/s2c/S2CRandomKeyMsg";
import { extensionMessage } from "./messageType/json/extensionMessage";
import Emittery from "emittery";

type ConnectionConfig = {
  methods?: {
    tls?: boolean | tls.ConnectionOptions,
    tcp?: boolean,
    http?: boolean,
    https?: boolean,
  },
  reportedApiVersion?: number,
}

export enum ExtensionMessageType {
  JSON,
  XML,
  STR,
}

interface ClientEvents {
  extensionMessage: { roomId: number, command: string, kind: ExtensionMessageType.JSON, dataObject: JsonValue }
                  | { roomId: number, command: string, kind: ExtensionMessageType.XML,  dataObject: unknown   }
                  | { roomId: number, command: string, kind: ExtensionMessageType.STR,  dataObject: string[]  },
}

export class Client extends Emittery<ClientEvents> {
  static async connect(address: string, port = 9339, config?: ConnectionConfig): Promise<Client> {
    const client = await this.getSocket(address, port, config?.methods ?? { tls: true });

    await client.sendXml(new C2SCheckVersionMsg(0, config?.reportedApiVersion ?? 165));

    const response = await client.expectXml(S2CApiVersionOkMsg, S2CApiVersionKoMsg);

    if (response instanceof S2CApiVersionKoMsg)
      throw new Error("reportedApiVersion " + (config?.reportedApiVersion ?? 165) + " out of date!");

    return new Client(client);
  }

  private static async getSocket(address: string, port: number, config: Required<ConnectionConfig>["methods"]) {
    const errors: [unknown, unknown, unknown, unknown] = [undefined, undefined, undefined, undefined];

    if (config.tls === true || typeof config.tls === "object")
      try { return await TlsClient.connect(address, port, typeof config.tls === "object" ? config.tls : {}) }
      catch (e: unknown) { errors[0] = e }

    if (config.https === true)
      try { throw new Error("HTTPS not yet supported") }
      catch (e: unknown) { errors[1] = e }

    if (config.tcp === true)
      try { return await TcpClient.connect(address, port) }
      catch (e: unknown) { errors[2] = e }

    if (config.http === true)
      try { throw new Error("HTTP not yet supported") }
      catch (e: unknown) { errors[3] = e }

    throw new ConnectionFailureError(...errors);
  }

  private constructor(
    public readonly socket: ClientSocket,
  ) {
    super()

    socket.on("jsonMessage", m => this.handleJsonMessage(m));
  }

  handleJsonMessage(m: JsonValue) {
    const xtMsg = extensionMessage.parse(m);

    const { o: dataObject, r: roomId } = xtMsg.b;
    const { _cmd: command } = dataObject;

    delete dataObject._cmd;

    if (typeof command !== "string")
      throw new Error("Expected string _cmd property on dataObject");

    this.emit("extensionMessage", { command, roomId, dataObject, kind: ExtensionMessageType.JSON })
  }

  async getRandomKey() {
    this.socket.sendXml(new C2SGetRandomKeyMessage);

    return (await this.socket.expectXml(S2CRandomKeyMsg)).randomKey;
  }
}
