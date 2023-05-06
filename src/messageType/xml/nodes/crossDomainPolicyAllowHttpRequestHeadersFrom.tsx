import { Node, ManagedElement } from "typed-xml";
import { HeaderFilter } from "../../../utils/headerFilter";
import { PortSet } from "../../../utils/portSet";
import { context } from "../handler";

export type PermittedCrossDomainPolicies = "none" | "master-only" | "by-content-type" | "by-ftp-filename" | "all";

export class CrossDomainPolicyAllowHttpRequestHeadersFrom extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicyAllowHttpRequestHeadersFrom {
    if (Object.keys(attributes).length > 3)
      throw new Error("Expected 1 attribute on a CrossDomainPolicy <allow-http-request-headers-from>");

    if (attributes["domain"] === undefined)
      throw new Error("Expected domain attribute on a CrossDomainPolicy <allow-http-request-headers-from>");

    if (attributes["headers"] === undefined)
      throw new Error("Expected headers attribute on a CrossDomainPolicy <allow-http-request-headers-from>");

    if (children.length > 0)
      throw new Error("Unknown children on a CrossDomainPolicy <allow-http-request-headers-from>");

    let secure: boolean | undefined = undefined;

    if (attributes["secure"]) {
      const attrSecure = attributes["secure"].toLowerCase();

      if (attrSecure !== "true" && attrSecure !== "false")
        throw new Error("<allow-http-request-headers-from> attribute 'secure' must be true or false");

      secure = attrSecure === "true";
    }

    return new CrossDomainPolicyAllowHttpRequestHeadersFrom(
      attributes["domain"],
      HeaderFilter.fromString(attributes["headers"]),
      secure,
    );
  }

  constructor(
    public domain: string,
    public headers: HeaderFilter,
    public secure?: boolean,
  ) { super() }

  render() {
    const base = <allow-http-request-headers-from domain={this.domain} headers={this.headers.toString()} />

    if (this.secure !== undefined)
      base[0].setAttribute("secure", this.secure.toString());

    return base;
  }
}

context.registerCustomNamedConstructor("allow-http-request-headers-from", CrossDomainPolicyAllowHttpRequestHeadersFrom);
