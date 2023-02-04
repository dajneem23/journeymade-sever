/**
 * f9. min(a,b) < Mean(a,b) trước	Xu hướng giảm
 */
export const f9 = (data) => {
  const { a, b } = data[0];
  const { a: a1, b: b1 } = data[1];

  return [
    Math.min(a, b) < (a1 + b1) / 2,
    'f9: Xu hướng giảm'
  ];
};
