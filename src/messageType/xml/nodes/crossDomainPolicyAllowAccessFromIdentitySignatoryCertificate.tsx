import { ManagedElement, Node } from "typed-xml";
import { context } from "../handler";

export class CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate {
    if (Object.keys(attributes).length !== 2)
      throw new Error("Expected 2 attributes on a CrossDomainPolicyAllowAccessFromIdentitySignatory <certificate>");

    if (children.length !== 1)
      throw new Error("Unknown children on a CrossDomainPolicyAllowAccessFromIdentitySignatory <certificate>");

    const fingerprint = Buffer.from(attributes["fingerprint"].replace(/ |:/g, "").toLowerCase(), "hex");
    const fingerprintAlgorithm = attributes["fingerprint-algorithm"].toLowerCase();

    return new CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate(fingerprintAlgorithm, fingerprint);
  }

  constructor(
    public fingerprintAlgorithm: string,
    public fingerprint: Buffer,
  ) { super() }

  render() {
    return <certificate fingerprint-algorithm={this.fingerprintAlgorithm} fingerprint={this.fingerprint.toString("hex")} />
  }
}

context.registerCustomNamedConstructor("certificate", CrossDomainPolicyAllowAccessFromIdentitySignatoryCertificate);
