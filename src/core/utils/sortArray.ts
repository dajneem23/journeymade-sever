export const sortArray = function (array, field, type) {
  return type === 'desc' ? array.sort((a, b) => b[field] - a[field]) : array.sort((a, b) => a[field] - b[field]);
};
