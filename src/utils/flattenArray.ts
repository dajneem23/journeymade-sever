export function flattenArray(arr) {
  return arr.reduce((acc, e) => Array.isArray(e) ? acc.concat(flattenArray(e)) : acc.concat(e), []);
};