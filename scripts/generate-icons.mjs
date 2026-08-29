import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

let crcTable
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw)

  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4)

  const cx = size / 2
  const cy = size / 2
  if (maskable) {
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 37
      rgba[i + 1] = 99
      rgba[i + 2] = 235
      rgba[i + 3] = 255
    }
  } else {
    const r = size * 0.47
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx
        const dy = y - cy
        const idx = (y * size + x) * 4
        if (dx * dx + dy * dy <= r * r) {
          rgba[idx] = 37
          rgba[idx + 1] = 99
          rgba[idx + 2] = 235
          rgba[idx + 3] = 255
        }
      }
    }
  }

  const armThickness = size * 0.16
  const armLength = size * 0.5
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const inVertical = Math.abs(dx) <= armThickness / 2 && Math.abs(dy) <= armLength / 2
      const inHorizontal = Math.abs(dy) <= armThickness / 2 && Math.abs(dx) <= armLength / 2
      if (inVertical || inHorizontal) {
        const idx = (y * size + x) * 4
        rgba[idx] = 255
        rgba[idx + 1] = 255
        rgba[idx + 2] = 255
        rgba[idx + 3] = 255
      }
    }
  }

  return encodePNG(size, size, rgba)
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', drawIcon(192))
writeFileSync('public/icons/icon-512.png', drawIcon(512))
writeFileSync('public/icons/icon-512-maskable.png', drawIcon(512, { maskable: true }))
console.log('icones gerados em public/icons/')
