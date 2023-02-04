/**
 * "f4. a-b < 0: Xanh
 */
export const f4 = (data) => {
  const { a, b } = data[0];
  return [
    a - b < 0,
    'f4: Nến xanh'
  ];
};
