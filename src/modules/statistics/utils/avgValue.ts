export const avgValue = (array, field) => {
  if (!array || array.length === 0) return;
  
  let sum = 0, count = 0;
  array.forEach((obj) => {
    if (obj && obj[field]) {
      sum += +obj[field];
      count += 1;
    }
  });

  return count > 0
    ? sum/count
    : 0;
};
