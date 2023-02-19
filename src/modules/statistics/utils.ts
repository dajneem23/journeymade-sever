export const percentage = (current, prev) => {
  if (!prev) return 100;

  return ((+current - +prev) / +prev) * 100;
};

export const setIntervalLimited = (callback, interval, x) => {
  for (let i = 0; i < x; i++) {
    setTimeout(callback, i * interval);
  }
};
