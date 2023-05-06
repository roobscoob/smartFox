export function bt(bool: boolean | undefined) {
  if (bool === undefined)
    return undefined;

  return bool ? <const> "1" : <const> "0"
}
