export class PortSet {
  static fromString(str: string) {
    const strings = str.split(",");

    return new PortSet(strings.map(str => {
      if (str === "*")
        return "*";

      if (str.includes("-"))
        return str.split("-").map(e => parseInt(e)) as [number, number];

      return parseInt(str);
    }) as (number | [number, number] | "*"))
  }

  protected readonly rules: (number | [number, number] | "*")[];

  constructor(
    ...rules: (number | [number, number] | "*")[]
  ) {
    this.rules = rules;
  }

  includesPort(port: number) {
    for (const rule of this.rules) {
      if (typeof rule === "number" && rule === port)
        return true;

      if (typeof rule === "object" && rule[0] <= port && rule[1] >= port)
        return true;

      if (typeof rule === "string")
        return true;
    }
  }

  toString() {
    return this.rules
      .map(r => typeof r === "number" ? r.toString() : typeof r === "string" ? r : r.join("-"))
      .join(",");
  }
}
