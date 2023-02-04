/**
 * f7. min(a,b) hiện tại < d trước	Đảo chiều giảm
 */
export const f7 = (data) => {
  const { a, b } = data[0];
  const { d: d1 } = data[1];

  return [
    Math.min(a, b) < d1,
    'f7: Đảo chiều giảm'
  ];
};
