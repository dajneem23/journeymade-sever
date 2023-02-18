export const percentage = (current, prev) => {
  if (!prev) return 100;
  
  return ((+current - +prev) / +prev) * 100;
};
