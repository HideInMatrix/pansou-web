// Utility to recursively convert BigInt values to strings so JSON serialization
// (used by h3/Nitro) doesn't throw `Do not know how to serialize a BigInt`.
export function replaceBigIntWithString(input: any): any {
  if (input === null || input === undefined) return input;

  const t = typeof input;
  if (t === "bigint") return input.toString();
  if (t === "string" || t === "number" || t === "boolean") return input;
  if (Array.isArray(input)) return input.map(replaceBigIntWithString);
  if (t === "object") {
    // Preserve non-plain objects by copying enumerable properties
    const out: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      out[key] = replaceBigIntWithString(input[key]);
    }
    return out;
  }
  return input;
}

export function serializeForJson(obj: any): string {
  // First replace BigInt -> string, then stringify with 2-space indent
  return JSON.stringify(replaceBigIntWithString(obj), null, 2);
}
