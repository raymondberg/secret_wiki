export default function allDefined(...args) {
  return !anyUndefined(...args);
}

export function anyUndefined(...args) {
  return args.some(
    (arg) => arg === null || arg === undefined || arg === "null"
  );
}

export function baseUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}

export function wikiUrl() {
  let params = new URLSearchParams(window.location.search);
  return `${baseUrl()}/?w=${params.get("w")}&p=`;
}

export function linkReplace(text) {
  let params = new URLSearchParams(window.location.search);
  return text.replaceAll("(page:", `(${baseUrl()}/?w=${params.get("w")}&p=`);
}
