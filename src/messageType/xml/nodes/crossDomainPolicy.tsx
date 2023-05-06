import { Node, ManagedElement } from "typed-xml";
import { context } from "../handler";
import { CrossDomainPolicyAllowAccessFrom } from "./crossDomainPolicyAllowAccessFrom";
import { CrossDomainPolicyAllowAccessFromIdentity } from "./crossDomainPolicyAllowAccessFromIdentity";
import { CrossDomainPolicyAllowHttpRequestHeadersFrom } from "./crossDomainPolicyAllowHttpRequestHeadersFrom";
import { CrossDomainPolicySiteControl, PermittedCrossDomainPolicies } from "./crossDomainPolicySiteControl";

export class CrossDomainPolicy extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): CrossDomainPolicy {
    if (Object.keys(attributes).length !== 0)
      throw new Error("Unknown attributes on a CrossDomainPolicy");

    const siteControls = children.filter(el => el instanceof CrossDomainPolicySiteControl) as CrossDomainPolicySiteControl[];

    if (siteControls.length > 1)
      throw new Error("Expected at most 1 <site-control> child");

    const [ siteControl ] = siteControls;

    let permittedCrossDomainPolicies: PermittedCrossDomainPolicies | undefined = siteControl
      ? siteControl.permittedCrossDomainPolicies
      : undefined;

    return new CrossDomainPolicy(
      permittedCrossDomainPolicies,
      children.filter(el => el instanceof CrossDomainPolicyAllowAccessFrom) as CrossDomainPolicyAllowAccessFrom[],
      children.filter(el => el instanceof CrossDomainPolicyAllowHttpRequestHeadersFrom) as CrossDomainPolicyAllowHttpRequestHeadersFrom[],
      children.filter(el => el instanceof CrossDomainPolicyAllowAccessFromIdentity) as CrossDomainPolicyAllowAccessFromIdentity[],
    );
  }

  constructor(
    public permittedCrossDomainPolicies: PermittedCrossDomainPolicies | undefined = "all",
    public allowAccessFrom: CrossDomainPolicyAllowAccessFrom[] = [],
    public allowHttpRequestHeadersFrom: CrossDomainPolicyAllowHttpRequestHeadersFrom[] = [],
    public allowAccessFromIdentity: CrossDomainPolicyAllowAccessFromIdentity[] = [],
  ) { super() }

  render() {
    return <cross-domain-policy>
      { this.permittedCrossDomainPolicies !== undefined ? new CrossDomainPolicySiteControl(this.permittedCrossDomainPolicies).render() : <></> }
      { ...this.allowAccessFrom.map(e => e.render()) }
      { ...this.allowHttpRequestHeadersFrom.map(e => e.render()) }
      { ...this.allowAccessFromIdentity.map(e => e.render()) }
    </cross-domain-policy>
  }
}

context.registerCustomNamedConstructor("cross-domain-policy", CrossDomainPolicy);
