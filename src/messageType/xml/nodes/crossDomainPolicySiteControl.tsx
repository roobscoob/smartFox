import { Node, ManagedElement } from "typed-xml";
import { context } from "../handler";

export type PermittedCrossDomainPolicies = "none" | "master-only" | "by-content-type" | "by-ftp-filename" | "all";

export class CrossDomainPolicySiteControl extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicySiteControl {
    if (Object.keys(attributes).length !== 1)
      throw new Error("Expected 1 attribute on a CrossDomainPolicy <site-control>");

    if (attributes["permitted-cross-domain-policies"] === undefined)
      throw new Error("Expected permitted-cross-domain-policies attribute on a CrossDomainPolicy <site-control>");

    if (children.length > 0)
      throw new Error("Unknown children on a CrossDomainPolicy <site-control>");

    return new CrossDomainPolicySiteControl(attributes["permitted-cross-domain-policies"] as PermittedCrossDomainPolicies);
  }

  constructor(
    public permittedCrossDomainPolicies: PermittedCrossDomainPolicies,
  ) { super() }

  render() {
    return <site-control permitted-cross-domain-policies={this.permittedCrossDomainPolicies} />
  }
}

context.registerCustomNamedConstructor("site-control", CrossDomainPolicySiteControl);
