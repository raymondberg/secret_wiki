export default function allDefined(...args) {
  return !anyUndefined(...args);
}

export function anyUndefined(...args) {
  return args.some(
    (arg) => arg === null || arg === undefined || arg === "null"
  );
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
