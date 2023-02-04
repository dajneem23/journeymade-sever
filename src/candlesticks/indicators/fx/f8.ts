/**
 * f8. max(a,b) > Mean(a,b) trước	Xu hướng tăng
 */
export const f8 = (data) => {
  const { a, b } = data[0];
  const { a: a1, b: b1 } = data[1];

  return [
    Math.max(a, b) > (a1 + b1) / 2,
    'f8: Xu hướng tăng'
  ];
};
