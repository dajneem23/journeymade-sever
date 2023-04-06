export function getRecachegooseKey({ module, id }) {
  return `mongoose:${module}:${id}`
} 