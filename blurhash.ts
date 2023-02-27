// blurhash command-line tool
// by Adam R. Nelson <adam@nels.onl>

import { decode, encode } from "./mod.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickReadSettings,
} from "https://deno.land/x/imagemagick_deno@0.0.19/mod.ts";

await initializeImageMagick();

console.log(`reading ${Deno.args[0]}`);

const imageData = await Deno.readFile(Deno.args[0]);

const { rgba, width, height } = ImageMagick.read(imageData, (img) => {
  if (img.width > 128) {
    img.resize(64, 64 * (img.height / img.width));
  }
  return img.write(
    (rgba) => ({ rgba, width: img.width, height: img.height }),
    MagickFormat.Rgba,
  );
});

const blurhash = encode(new Uint8ClampedArray(rgba), width, height, 4, 3);

console.log(`blurhash: ${blurhash}`);

const blurdata = decode(blurhash, width * 2, height * 2);

console.log("writing blur.png");

await ImageMagick.read(
  new Uint8Array(blurdata),
  new MagickReadSettings({
    format: MagickFormat.Rgba,
    width: width * 2,
    height: height * 2,
  }),
  (img) =>
    img.write((data) => Deno.writeFile("blur.png", data), MagickFormat.Png),
);

console.log("done?");
