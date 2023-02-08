/**
 * f5. a - b > 0: Đỏ
 */
export const f5 = (data) => {
  const { a, b } = data[0];
  return [
    a - b > 0,
    'f5: Nến đỏ'
  ];
};
