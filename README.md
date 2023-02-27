# Deno BlurHash

A simple port of the Typescript implementation of [BlurHash][blurhash] to Deno.
Includes improvements from [`fast-blurhash`][fast-blurhash].

## Example Usage

```typescript
import { decode, encode } from 'https://deno.land/x/blurhash/mod.ts'

const rgbaData: Uint8ClampedArray = getSomeRawImageData()
const width = 256, height = 192

// componentX/componentY can be 1-9, these determine the complexity of the blur
const componentX = 4, componentY = 3

const blurHash: string = encode(rgbaData, width, height, componentX, componentY)

const blurRgbaData: Uint8ClampedArray = decode(blurHash, width, height)
```

## Command-line Tool

This module includea a command-line tool for encoding and decoding BlurHashes.
It can even display a BlurHash image in the terminal using ANSI True Color
escape codes, if your terminal supports it.

You can run it directly from a URL, which will print a usage message:

```
deno run https://deno.land/x/blurhash/blurhash.ts
```

Some usage examples:

```
deno run https://deno.land/x/blurhash/blurhash.ts encode -x 7 -y 7 < foo.jpg
deno run --allow-write=blur.jpg https://deno.land/x/blurhash/blurhash.ts decode 'LEHLk~WB2yk8pyo0adR*.7kCMdnj' blur.jpg -w 128 -h 64
deno run https://deno.land/x/blurhash/blurhash.ts display 'LEHLk~WB2yk8pyo0adR*.7kCMdnj' -w 80 -h 20
```

## License

This is mostly repackaged code from BlurHash and `fast-blurhash`, both of which
are ISC licensed. My changes to this code are also distributed under an ISC
license.

[blurhash]: https://github.com/woltapp/blurhash
[fast-blurhash]: https://github.com/mad-gooze/fast-blurhash
