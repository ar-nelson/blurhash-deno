const pow = Math.pow;
const PI = Math.PI;
const PI2 = PI * 2;

const d = 3294.6;
const e = 269.025;

export const sRGBToLinear = (value: number) =>
  value > 10.31475 ? pow(value / e + 0.052132, 2.4) : value / d;

export const linearTosRGB = (v: number) =>
  ~~(v > 0.00001227 ? e * pow(v, 0.416666) - 13.025 : v * d + 1);

export const sign = (n: number) => (n < 0 ? -1 : 1);

export const signSqr = (x: number) => (x < 0 ? -1 : 1) * x * x;

/**
 * Fast approximate cosine implementation
 * Based on FTrig https://github.com/netcell/FTrig
 */
export const fastCos = (x: number) => {
  x += PI / 2;
  while (x > PI) {
    x -= PI2;
  }
  const cos = 1.27323954 * x - 0.405284735 * signSqr(x);
  return 0.225 * (signSqr(cos) - cos) + cos;
};

export const signPow = (val: number, exp: number) =>
  sign(val) * pow(Math.abs(val), exp);
