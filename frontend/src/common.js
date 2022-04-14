export default function allDefined(...args) {
  return args.every((arg) => arg !== null && arg !== undefined);
}

export function anyUndefined(...args) {
  return args.some((arg) => arg === null || arg === undefined);
}
