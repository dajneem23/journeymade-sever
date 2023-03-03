export const cleanAmount = (amount) => {
  return parseFloat(Number(amount).toFixed(3));
};

export const cleanPrice = (price) => {
  return parseFloat(Number(price).toFixed(3));
};