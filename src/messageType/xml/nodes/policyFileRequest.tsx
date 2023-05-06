import { Node, ManagedElement } from "typed-xml";
import { context } from "../handler";

export class PolicyFileRequest extends ManagedElement {
  static new(attributes: Record<string, string>, children: Node[]): PolicyFileRequest {
    if (Object.keys(attributes).length !== 0)
      throw new Error("Unknown attributes on a PolicyFileRequest");

    if (children.length > 0)
      throw new Error("Unknown children on a PolicyFileRequest");

    return new PolicyFileRequest;
  }

  render() {
    return <policy-file-request />
  }
}

context.registerCustomNamedConstructor("policy-file-request", PolicyFileRequest);
