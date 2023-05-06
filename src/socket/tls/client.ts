import { CrossDomainPolicy } from "../../messageType/xml/nodes/crossDomainPolicy";
import { PolicyFileRequest } from "../../messageType/xml/nodes/policyFileRequest";
import { parseAllXml, parseXml } from "../../messageType/xml/handler";
import { ClientSocketEvents, ClientSocket, JsonValue } from "../socket";
import Emittery from "emittery";
import split from "split2";
import tls from "node:tls";
import { DefaultElement, ManagedElement, Node, ProcessingInstructionNode, TextNode } from "typed-xml";
import type { Transform } from "node:stream";
import { S2CMsg } from "../../messageType/xml/nodes/msg";

export class TlsClient extends ClientSocket {
  static connect(address: string, port: number, options: tls.ConnectionOptions, requestPolicy = false) {
    return new Promise<TlsClient>((res, rej) => {
      const socket = tls.connect(port, address, options);
  
      function handleError(e: Error) {
        socket.off("close", handleClose);
        socket.off("secureConnect", handleConnect);

        rej(e);
      }

      function handleClose() {
        socket.off("error", handleError);
        socket.off("secureConnect", handleConnect);

        rej(new Error("Socket closed"));
      }

      function handleConnect() {
        socket.off("error", handleError);
        socket.off("close", handleClose);

        if (!socket.authorized) {
          rej(socket.authorizationError);
          return;
        }

        if (requestPolicy)
          socket.write(new PolicyFileRequest().toString() + "\x00");

        const pipedSocket = socket.pipe(split("\x00"))

        pipedSocket.once("data", async (chunk: string) => {
          try {
            let nodes = await parseAllXml(chunk);

            const xdomainpolicy = nodes.find(node => node instanceof CrossDomainPolicy) as CrossDomainPolicy | undefined

            if (xdomainpolicy === undefined)
              throw 0;

            const client = new TlsClient(socket, pipedSocket, xdomainpolicy);

            res(client);
          } catch (_) {
            const client = new TlsClient(socket, pipedSocket);

            res(client);

            process.nextTick(() => {
              client.handleChunk(Buffer.from(chunk, "utf-8"));
            });
          }
        })
      }

      socket.once("error", handleError);
      socket.once("close", handleClose);
      socket.once("secureConnect", handleConnect);
    })
  }

  constructor(
    protected readonly socket: tls.TLSSocket,
    protected readonly pipedSocket: Transform,
    protected readonly policy?: CrossDomainPolicy
  ) {
    super();

    pipedSocket
      .on("data", (chunk) => this.handleChunk(chunk))

    socket
      .on("error", (e) => this.handleError(e))
      .on("close", () => this.handleClose())
  }

  sendXml(element: ManagedElement): Promise<void> {
    return this.sendRaw(element.toString({ spaceBeforeSelfClosingTag: true, attributeQuoteType: "'" }));
  }

  sendStr(strings: string[]): Promise<void> {
    return this.sendRaw(`%${strings.join("%")}%`);
  }

  sendJson(object: JsonValue): Promise<void> {
    return this.sendRaw(JSON.stringify(object));
  }

  close() {
    return new Promise<void>(res => {
      this.socket.end(res);
    })
  }

  getPolicy() {
    return this.policy;
  }

  private sendRaw(string: string) {
    console.log("SEND", JSON.stringify(string));

    return new Promise<void>((res, rej) => {
      this.socket.write(string + "\x00", "utf-8", (e) => {
        if (e)
          rej(e)
        else
          res()
      });
    })
  }

  private async handleChunk(chunk: Buffer) {
    const string = chunk.toString("utf-8")

    console.log("Chunk", string);

    const kind = string[0];

    switch (kind) {
      case "%":
        this.emit("strMessage", string.slice(1, -1).split("%"));
        return;
      case "{":
        this.emit("jsonMessage", JSON.parse(string));
        return;
      case "<": {
        const de = await parseXml(string);

        if (!(de instanceof DefaultElement)) {
          this.emit("xmlMessage", de);
          return;
        }

        const msg = de.into(S2CMsg.new);
        this.emit("xmlMessage", msg);

        return;
      }
    }

    this.emit("error", new Error("Unexpected message that started with an unexpected character. " + chunk));

    this.socket.end();
  }

  private handleClose() {
    this.emit("close");

    this.clearListeners("strMessage");
    this.clearListeners("jsonMessage");
    this.clearListeners("xmlMessage");
  }

  private handleError(e: Error) {
    this.emit("error", e);

    this.clearListeners("strMessage");
    this.clearListeners("jsonMessage");
    this.clearListeners("xmlMessage");
  }
}
