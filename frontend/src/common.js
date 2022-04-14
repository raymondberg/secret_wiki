export default function allDefined(...args) {
  return args.every((arg) => arg !== null && arg !== undefined);
}

export function anyUndefined(...args) {
  return args.some((arg) => arg === null || arg === undefined);
}

export function linkReplace(text) {
  return text.replaceAll("(page:", "(http://localhost:3000/?w=Mulan&p=");
}
