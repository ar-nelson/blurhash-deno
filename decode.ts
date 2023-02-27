import { decode83 } from "./base83.ts";
import { ValidationError } from "./error.ts";
import { fastCos, linearTosRGB, signSqr, sRGBToLinear } from "./utils.ts";

/**
 * Returns an error message if invalid or undefined if valid
 * @param blurhash
 */
const validateBlurhash = (blurhash: string) => {
  if (!blurhash || blurhash.length < 6) {
    throw new ValidationError(
      "The blurhash string must be at least 6 characters",
    );
  }

  const sizeFlag = decode83(blurhash[0], 0, blurhash[0].length);
  const numY = Math.floor(sizeFlag / 9) + 1;
  const numX = (sizeFlag % 9) + 1;

  if (blurhash.length !== 4 + 2 * numX * numY) {
    throw new ValidationError(
      `blurhash length mismatch: length is ${blurhash.length} but it should be ${
        4 + 2 * numX * numY
      }`,
    );
  }
};

export const isBlurhashValid = (
  blurhash: string,
): { result: boolean; errorReason?: string } => {
  try {
    validateBlurhash(blurhash);
  } catch (error) {
    return { result: false, errorReason: error.message };
  }

  return { result: true };
};

/**
 * Extracts average color from BlurHash image
 * @param blurHash BlurHash image string
 */
export function getBlurHashAverageColor(
  blurHash: string,
): [number, number, number] {
  const val = decode83(blurHash, 2, 6);
  return [val >> 16, (val >> 8) & 255, val & 255];
}

const PI = Math.PI;

/**
 * Decodes BlurHash image
 * @param blurHash BlurHash image string
 * @param width Output image width
 * @param height Output image height
 * @param punch
 */
export function decodeBlurHash(
  blurHash: string,
  width: number,
  height: number,
  punch = 1,
): Uint8ClampedArray {
  const sizeFlag = decode83(blurHash, 0, 1);
  const numX = (sizeFlag % 9) + 1;
  const numY = ~~(sizeFlag / 9) + 1;
  const size = numX * numY;

  let i = 0,
    j = 0,
    x = 0,
    y = 0,
    r = 0,
    g = 0,
    b = 0,
    basis = 0,
    basisY = 0,
    colorIndex = 0,
    pixelIndex = 0,
    yh = 0,
    xw = 0,
    value = 0;

  const maximumValue = ((decode83(blurHash, 1, 2) + 1) / 13446) * (punch | 1);

  const colors = new Float64Array(size * 3);

  const averageColor = getBlurHashAverageColor(blurHash);
  for (i = 0; i < 3; i++) {
    colors[i] = sRGBToLinear(averageColor[i]);
  }

  for (i = 1; i < size; i++) {
    value = decode83(blurHash, 4 + i * 2, 6 + i * 2);
    colors[i * 3] = signSqr(~~(value / (19 * 19)) - 9) * maximumValue;
    colors[i * 3 + 1] = signSqr((~~(value / 19) % 19) - 9) * maximumValue;
    colors[i * 3 + 2] = signSqr((value % 19) - 9) * maximumValue;
  }

  const bytesPerRow = width * 4;
  const pixels = new Uint8ClampedArray(bytesPerRow * height);

  for (y = 0; y < height; y++) {
    yh = (PI * y) / height;
    for (x = 0; x < width; x++) {
      r = 0;
      g = 0;
      b = 0;
      xw = (PI * x) / width;

      for (j = 0; j < numY; j++) {
        basisY = fastCos(yh * j);
        for (i = 0; i < numX; i++) {
          basis = fastCos(xw * i) * basisY;
          colorIndex = (i + j * numX) * 3;
          r += colors[colorIndex] * basis;
          g += colors[colorIndex + 1] * basis;
          b += colors[colorIndex + 2] * basis;
        }
      }

      pixelIndex = 4 * x + y * bytesPerRow;
      pixels[pixelIndex] = linearTosRGB(r);
      pixels[pixelIndex + 1] = linearTosRGB(g);
      pixels[pixelIndex + 2] = linearTosRGB(b);
      pixels[pixelIndex + 3] = 255; // alpha
    }
  }
  return pixels;
}

export default decodeBlurHash;
