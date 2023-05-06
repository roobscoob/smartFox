import { Node, ManagedElement } from "typed-xml";
import { PortSet } from "../../../utils/portSet";
import { context } from "../handler";

export type PermittedCrossDomainPolicies = "none" | "master-only" | "by-content-type" | "by-ftp-filename" | "all";

export class CrossDomainPolicyAllowAccessFrom extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicyAllowAccessFrom {
    if (Object.keys(attributes).length > 3)
      throw new Error("Expected 1 attribute on a CrossDomainPolicy <allow-access-from>");

    if (attributes["domain"] === undefined)
      throw new Error("Expected domain attribute on a CrossDomainPolicy <allow-access-from>");

    if (children.length > 0)
      throw new Error("Unknown children on a CrossDomainPolicy <allow-access-from>");

    let secure: boolean | undefined = undefined;

    if (attributes["secure"]) {
      const attrSecure = attributes["secure"].toLowerCase();

      if (attrSecure !== "true" && attrSecure !== "false")
        throw new Error("<allow-access-from> attribute 'secure' must be true or false");

      secure = attrSecure === "true";
    }

    let toPorts: PortSet | undefined = undefined;

    if (attributes["to-ports"]) {
      toPorts = PortSet.fromString(attributes["to-ports"]);
    }

    return new CrossDomainPolicyAllowAccessFrom(
      attributes["domain"],
      secure,
      toPorts,
    );
  }

  constructor(
    public domain: string,
    public secure?: boolean,
    public toPorts?: PortSet,
  ) { super() }

  render() {
    const base = <allow-access-from domain={this.domain} />

    if (this.secure !== undefined)
      base[0].setAttribute("secure", this.secure.toString());

    if (this.toPorts !== undefined)
      base[0].setAttribute("to-ports", this.toPorts.toString());

    return base;
  }
}

context.registerCustomNamedConstructor("allow-access-from", CrossDomainPolicyAllowAccessFrom);
