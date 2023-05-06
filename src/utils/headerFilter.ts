export class HeaderFilter {
  static fromString(str: string) {
    return new HeaderFilter(str.split(","));
  }

  constructor(protected readonly rules: string[]) {}

  includesHeader(header: string) {
    for (const rule of this.rules) {
      if (rule === header)
        return true;

      if (rule.endsWith("*") && header.startsWith(rule.slice(0, -1)))
        return true;
    }
  }

  toString() {
    return this.rules
      .join(",");
  }
}
