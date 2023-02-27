// blurhash command-line tool
// by Adam R. Nelson <adam@nels.onl>

import { decode, encode, isBlurhashValid } from "./mod.ts";
import { Buffer } from "https://deno.land/std@0.176.0/io/mod.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickReadSettings,
} from "https://deno.land/x/imagemagick_deno@0.0.19/mod.ts";
import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.7/ansi/colors.ts";

await initializeImageMagick();

await new Command()
  .name("blurhash")
  .version("1.0")
  .description("Command-line tool for BlurHash (https://blurha.sh)")
  .helpOption("--help", "Show this help.", { global: true })
  .action(() => {
    throw new ValidationError("no command selected");
  })
  .command(
    "encode [image:string]",
    "Create a BlurHash from an image file or standard in, writing to standard out.",
  )
  .option("-x, --componentX <componentX:number>", "Component X, default is 4")
  .option("-y, --componentY <componentY:number>", "Component Y, default is 3")
  .action(async ({ componentX = 4, componentY = 3 }, image?) => {
    let imageData: Uint8Array;
    if (image == null || image === "-") {
      const buf = new Buffer();
      await buf.readFrom(Deno.stdin);
      if (buf.length === 0) {
        throw new ValidationError(
          "no image filename and no data on standard in",
        );
      }
      imageData = buf.bytes();
    } else {
      imageData = await Deno.readFile(image);
    }
    const { rgba, width, height } = ImageMagick.read(imageData, (img) => {
      if (img.width > 128) {
        img.resize(64, 64 * (img.height / img.width));
      }
      return img.write(
        (rgba) => ({ rgba, width: img.width, height: img.height }),
        MagickFormat.Rgba,
      );
    });
    const blurhash = encode(
      new Uint8ClampedArray(rgba),
      width,
      height,
      componentX,
      componentY,
    );
    console.log(blurhash);
  })
  .command(
    "decode <hash:string> <outfile:string>",
    'Decode a BlurHash from an argument or standard in (if hash is "-"), writing an image to outfile. Image type is determined by extension.',
  )
  .option("-w, --width <width:number>", "Output width, default is 64")
  .option("-h, --height <height:number>", "Output height, default is 64")
  .option("-p, --punch <punch:number>", "Punch, default is 1")
  .action(
    async (
      { width = 64, height = 64, punch },
      hash: string,
      outfile: string,
    ) => {
      let filetype: MagickFormat;
      if (outfile.toLowerCase().endsWith(".png")) {
        filetype = MagickFormat.Png;
      } else if (
        outfile.toLowerCase().endsWith(".jpg") ||
        outfile.toLowerCase().endsWith(".jpeg")
      ) {
        filetype = MagickFormat.Jpg;
      } else if (outfile.toLowerCase().endsWith(".webp")) {
        filetype = MagickFormat.Webp;
      } else if (outfile.toLowerCase().endsWith(".bmp")) {
        filetype = MagickFormat.Bmp;
      } else if (outfile.toLowerCase().endsWith(".gif")) {
        filetype = MagickFormat.Gif;
      } else {
        console.error(
          `Cannot determine image type by extension of output file ${
            JSON.stringify(outfile)
          } (try .png or .jpg, maybe?)`,
        );
        Deno.exit(1);
      }
      if (hash === "-") {
        const buf = new Buffer();
        await buf.readFrom(Deno.stdin);
        hash = new TextDecoder().decode(buf.bytes());
      }
      if (!isBlurhashValid(hash)) {
        if (hash.length > 100) hash = hash.slice(0, 100) + "...";
        console.error(`Not a valid BlurHash: ${JSON.stringify(hash)}`);
        Deno.exit(1);
      }
      const blurdata = decode(hash, width, height, punch);
      await ImageMagick.read(
        new Uint8Array(blurdata),
        new MagickReadSettings({
          format: MagickFormat.Rgba,
          width,
          height,
        }),
        (img) => img.write((data) => Deno.writeFile(outfile, data), filetype),
      );
    },
  )
  .command(
    "display [hash:string]",
    "Print an ANSI True Color representation of a BlurHash to standard out. Requires a terminal with COLORTERM=truecolor. Reads from argument or standard in.",
  )
  .option("-w, --width <width:number>", "Output width, default is 48")
  .option("-h, --height <height:number>", "Output height, default is 24")
  .option("-p, --punch <punch:number>", "Punch, default is 1")
  .action(
    async (
      { width = 48, height = 24, punch },
      hash?: string,
    ) => {
      if (!hash || hash === "-") {
        const buf = new Buffer();
        await buf.readFrom(Deno.stdin);
        if (buf.length === 0) {
          throw new ValidationError(
            "no hash argument and no data on standard in",
          );
        }
        hash = new TextDecoder().decode(buf.bytes());
      }
      if (!isBlurhashValid(hash)) {
        if (hash.length > 100) hash = hash.slice(0, 100) + "...";
        console.error(`Not a valid BlurHash: ${JSON.stringify(hash)}`);
        Deno.exit(1);
      }
      const blurdata = new Uint32Array(
        decode(hash, width, height, punch).buffer,
      );
      for (let y = 0; y < height; y++) {
        let str = "";
        for (let x = 0; x < width; x++) {
          const px = blurdata[x + y * width];
          str += colors.bgRgb24(" ", {
            r: px & 0xff,
            g: (px >> 8) & 0xff,
            b: (px >> 16) & 0xff,
          });
        }
        console.log(str);
      }
    },
  )
  .parse(Deno.args);
