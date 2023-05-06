import { CDataNode, DefaultElement } from "typed-xml";
import { bt } from "../messageType/xml/nodes/helpers/boolTransformer";
import { parseCDataContentNode } from "../messageType/xml/nodes/helpers/cdataContentNode";
import { parseValue, serializeValue } from "../messageType/xml/nodes/helpers/parseValue";

type RoomVars = Record<string, { value: number | boolean | string | null, persist: boolean | undefined, private: boolean | undefined }>;

export class RoomVariables {
  static fromXml(vars: DefaultElement): [RoomVariables, boolean] {
    if (vars.getName().toLowerCase() !== "vars")
      throw new Error("Expected vars element");

    const setOwnership = (vars.getAttribute("so") ?? "1") === "1";
    const nodes = vars.getChildren().filter(e => e instanceof DefaultElement) as DefaultElement[];
    const returnVars: RoomVars = {};

    for (const node of nodes) {
      if (!(node instanceof DefaultElement) || node.getName().toLowerCase() !== "var")
        throw new Error("Expected all children of vars element to be a var");

      const name = node.getAttribute("n");

      if (name === undefined)
        throw new Error("Expected roomVars var to have a n(ame) attribute");

      const type = node.getAttribute("t");

      if (type === undefined)
        throw new Error("Expected roomVars var to have a t(ype) attribute");

      const value = parseValue(parseCDataContentNode(node.getChildren()), type);
      const priv = node.getAttribute("pr");
      const persist = node.getAttribute("pe");

      returnVars[name] = { value, private: priv !== undefined ? priv === "1" : undefined, persist: persist !== undefined ? persist === "1" : undefined }
    }

    return [ new RoomVariables(returnVars), setOwnership ];
  }

  constructor(
    protected readonly vars: RoomVars = {}
  ) { }

  isEmpty() {
    return Object.keys(this.vars).length === 0;
  }

  get(varName: string) {
    return this.vars[varName]?.value;
  }

  set(varName: string, varValue: string | number | boolean | null) {
    if (varValue === null)
      return this.delete(varName);

    if (varName in this.vars)
      return this.vars[varName].value = varValue;

    this.vars[varName] = { value: varValue, persist: undefined, private: undefined };
  }

  delete(varName: string) {
    delete this.vars[varName];
  }

  isPersistent(varName: string) {
    if (varName in this.vars)
      return this.vars[varName].persist ?? false;

    return undefined
  }

  isPrivate(varName: string) {
    if (varName in this.vars)
      return this.vars[varName].private ?? false;

    return undefined
  }

  has(varName: string) {
    return varName in this.vars;
  }

  render() {
    return <vars>
      {...Object.entries(this.vars).map(([name, { value, persist, private: priv }]) => {
        const [ type, valueString ] = serializeValue(value);

        return <var n={name} t={type} ps={bt(persist)} pr={bt(priv)}>{new CDataNode(valueString)}</var>
      })}
    </vars>
  }
}
