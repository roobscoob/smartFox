import { DefaultElement, FragmentElement, ManagedElement, Node } from "typed-xml";

export enum MessageType {
  System,
  Extension,
}

export abstract class C2SMsg extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (Object.keys(attributes).length !== 1)
      throw new Error("Expected only 1 attribute on Msg elements");

    const { t } = attributes;

    if (t !== "sys" && t !== "xt")
      throw new Error("Unknown msg type: " + t);

    const [ child, ...rest ] = children;

    if (rest.length > 0)
      throw new Error("Unexpected children");

    if (!(child instanceof DefaultElement) || child.getName().toLowerCase() !== 'body')
      throw new Error("Expected child to be a Body DefaultElement");

    const action = child.getAttribute("action");

    const childAttributes = child.getAttributes();
    const childChildren   = child.getChildren();

    switch(action) {
    }
  }

  constructor(
    public roomId: number = -1,
  ) { super() }

  abstract render(): FragmentElement;
}

export abstract class S2CMsg extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]) {
    if (Object.keys(attributes).length !== 1)
      throw new Error("Expected only 1 attribute on Msg elements");

    const { t } = attributes;

    if (t !== "sys" && t !== "xt")
      throw new Error("Unknown msg type: " + t);

    const [child, ...rest] = children;

    if (rest.length > 0)
      throw new Error("Unexpected children");

    if (!(child instanceof DefaultElement) || child.getName().toLowerCase() !== 'body')
      throw new Error("Expected child to be a Body DefaultElement");

    const action = child.getAttribute("action");

    const childAttributes = child.getAttributes();
    const childChildren = child.getChildren();

    switch (action) {
      case "apiOK": return S2CApiVersionOkMsg.new(childAttributes, childChildren);
      case "apiKO": return S2CApiVersionKoMsg.new(childAttributes, childChildren);
      case "rndK": return S2CRandomKeyMsg.new(childAttributes, childChildren);
      case "rmList": return S2CRoomListMsg.new(childAttributes, childChildren);
    }

    throw new Error("Unknown action: " + action);
  }

  constructor(
    public roomId: number = -1,
  ) { super() }

  abstract render(): FragmentElement;
}

import { S2CApiVersionOkMsg } from "./msgNodes/s2c/S2CApiVersionOkMsg";
import { S2CApiVersionKoMsg } from "./msgNodes/s2c/S2CApiVersionKoMsg";
import { S2CRandomKeyMsg } from "./msgNodes/s2c/S2CRandomKeyMsg";import { S2CRoomListMsg } from "./msgNodes/s2c/S2CRoomListMsg";

