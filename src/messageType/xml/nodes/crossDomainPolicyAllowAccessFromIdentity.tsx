import { Node, ManagedElement } from "typed-xml";
import { context } from "../handler";
import { CrossDomainPolicyAllowAccessFromIdentitySignatory } from "./crossDomainPolicyAllowAccessFromIdentitySignatory";

export type PermittedCrossDomainPolicies = "none" | "master-only" | "by-content-type" | "by-ftp-filename" | "all";

export class CrossDomainPolicyAllowAccessFromIdentity extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicyAllowAccessFromIdentity {
    if (Object.keys(attributes).length !== 0)
      throw new Error("Unknown attributes on a CrossDomainPolicy <allow-access-from-identity>");

    if (children.length !== 1)
      throw new Error("Expected 1 child on a CrossDomainPolicy <allow-access-from-identity>");

    const [ child ] = children;

    if (!(child instanceof CrossDomainPolicyAllowAccessFromIdentitySignatory))
      throw new Error("Expected child to be a CrossDomainPolicyAllowAccessFromIdentitySignatory");

    return new CrossDomainPolicyAllowAccessFromIdentity(child.fingerprintAlgorithm, child.fingerprint);
  }

  constructor(
    public fingerprintAlgorithm: string,
    public fingerprint: Buffer,
  ) { super() }

  render() {
    return <allow-access-from-identity>
      { new CrossDomainPolicyAllowAccessFromIdentitySignatory(this.fingerprintAlgorithm, this.fingerprint) }
    </allow-access-from-identity>
  }
}

context.registerCustomNamedConstructor("allow-access-from-identity", CrossDomainPolicyAllowAccessFromIdentity);
