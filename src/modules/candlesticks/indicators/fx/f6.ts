/**
 * f6. max(a,b) hiện tại > c trước:  Đảo chiều tăng
 */
export const f6 = (data) => {
  const { a, b } = data[0];
  const { c: c1 } = data[1];
  return [
    Math.max(a, b) > c1,
    'f6: Đảo chiều tăng'
  ];
};
