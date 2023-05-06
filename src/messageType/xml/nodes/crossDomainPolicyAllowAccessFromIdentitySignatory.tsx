import { ManagedElement, Node } from "typed-xml";
import { context } from "../handler";
import { CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate } from "./crossDomainPolicyAllowAccessFromIdentitySignatoryCertificate";

export class CrossDomainPolicyAllowAccessFromIdentitySignatory extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicyAllowAccessFromIdentitySignatory {
    if (Object.keys(attributes).length !== 0)
      throw new Error("Unknown attributes on a CrossDomainPolicyAllowAccessFromIdentity <signatory>");

    if (children.length !== 1)
      throw new Error("Expected 1 child on a CrossDomainPolicyAllowAccessFromIdentity <signatory>");

    const [child] = children;

    if (!(child instanceof CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate))
      throw new Error("Expected child to be a CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate");

    return new CrossDomainPolicyAllowAccessFromIdentitySignatory(child.fingerprintAlgorithm, child.fingerprint);
  }

  constructor(
    public fingerprintAlgorithm: string,
    public fingerprint: Buffer,
  ) { super() }

  render() {
    return <signatory>
      {new CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate(this.fingerprintAlgorithm, this.fingerprint).render()}
    </signatory>
  }
}
