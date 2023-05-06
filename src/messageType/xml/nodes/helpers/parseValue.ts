const ALL_VALID = new Set(["x", "b", "n", "s"])

export function parseValue(raw: string, type: string, validTypes: Set<string> = ALL_VALID): string | number | boolean | null {
  switch(type) {
    case "x": if (validTypes.has("x")) { return null } else { break };
    case "b": if (validTypes.has("b")) { return raw === "1" } else { break };
    case "n": if (validTypes.has("n")) { return parseFloat(raw) } else { break };
    case "s": if (validTypes.has("s")) { return raw } else { break };
  }

  throw new Error("Unknown or Invalid type: " + type);
}

export function serializeValue(value: string | number | boolean | null): ["s" | "n" | "b"| "x", string] {
  switch (typeof value) {
    case "string":
      return ["s", value];
    case "number":
      return ["n", value.toString()];
    case "boolean":
      return ["b", value ? "1" : "0"];
    case "object":
      return ["x", ""];
  }
}
