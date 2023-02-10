export const sumArrayByField = (array, field) => {
  return array.reduce((accumulator, object) => {
    return Number(accumulator) + Number(object[field]);
  }, 0);
};

