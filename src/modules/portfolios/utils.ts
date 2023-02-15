export const cleanAmount = (amount) => {
  return Number(amount);
};

export const cleanPrice = (price) => {
  return Number(price);
};

export const prepareOffsets = (max, limit) => {
  const offsets = [];
  for (let i = 0; i < Math.round(Number(max) / limit) * limit; i += limit) {
    offsets.push(i);
  }
  return offsets;
};