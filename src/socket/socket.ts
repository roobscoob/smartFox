import { CrossDomainPolicy } from "../messageType/xml/nodes/crossDomainPolicy";
import Emittery from "emittery";
import { DefaultElement, ManagedElement, Node } from "typed-xml";

export interface ClientSocketEvents {
  xmlMessage: Node,
  strMessage: string[],
  jsonMessage: JsonValue,
  close: never,
  error: Error,
}

export type JsonValue = { [key: string | number]: JsonValue } | JsonValue[] | number | string | boolean | null

export abstract class ClientSocket extends Emittery<ClientSocketEvents> {
  abstract sendXml(element: ManagedElement): Promise<void>;
  abstract sendStr(strings: string[]): Promise<void>;
  abstract sendJson(object: JsonValue): Promise<void>;
  abstract close(): Promise<void>;
  abstract getPolicy(): CrossDomainPolicy | undefined;

  async expectXml<T extends { new: (...args: any[]) => any, new(...args: any[]): any }[]>(...objects: T): Promise<ReturnType<T[number]["new"]>> {
    for await (const element of this.events("xmlMessage")) {
      for (const object of objects) {
        if (element instanceof object)
          return element as any;
      }
  
      if (!(element instanceof DefaultElement))
        continue;
  
      for (const object of objects) {
        try {
          return element.into(object as any)
        } catch(err) {
          continue;
        }
      }
    }

    throw new Error("Never.");
  }
}
