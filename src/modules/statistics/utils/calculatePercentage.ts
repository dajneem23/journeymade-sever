export default function (current, prev) {
  if (!prev) return null;

  return +(((+current - +prev) / +prev) * 100).toFixed(3);
};