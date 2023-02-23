export const sumArrayByField = (array, field) => {
  return array.length > 0 ? array.reduce((accumulator, object) => {
    return Number(accumulator) + Number(object[field]);
  }, 0) : 0;
};

