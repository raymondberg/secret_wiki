export default function allDefined(...args) {
  return args.every((arg) => arg !== null && arg !== undefined);
}

export function anyUndefined(...args) {
  return args.some((arg) => arg === null || arg === undefined);
}

export function linkReplace(text) {
  let params = new URLSearchParams(window.location.search);
  return text.replaceAll(
    "(page:",
    `(${window.location.protocol}//${window.location.host}/?w=${params.get(
      "w"
    )}&p=`
  );
}
