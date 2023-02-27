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

## License

This is mostly repackaged code from BlurHash and `fast-blurhash`, both of which
are ISC licensed. My changes to this code are also distributed under an ISC
license.

[blurhash]: https://github.com/woltapp/blurhash
[fast-blurhash]: https://github.com/mad-gooze/fast-blurhash
