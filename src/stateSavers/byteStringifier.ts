export function decodeBytes(str: string): ArrayBuffer {
  const numberOfBytes = toU32((str.charCodeAt(0) << 16) | str.charCodeAt(1));
  const bytes = new Uint8Array(numberOfBytes);

  for (let i = 0; i < numberOfBytes; i++) {
    const code = str.charCodeAt(2 + Math.floor(i / 2));

    const byte = i % 2 === 0 ? code >>> 8 : code;

    bytes[i] = byte;
  }
  return bytes.buffer;
}

function toU32(n: number): number {
  const arr = new Uint32Array(1);
  arr[0] = n;
  return arr[0];
}

export function encodeBytes(bytes: Uint8Array): string {
  const numberOfBytes = bytes.length;
  const u16s = new Array(Math.ceil(numberOfBytes / 2));

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (i % 2 === 0) {
      u16s[i / 2] = byte << 8;
    } else {
      u16s[(i - 1) / 2] |= byte;
    }
  }

  return (
    String.fromCharCode(
      numberOfBytes >>> 16,
      numberOfBytes & 0b0000_0000_0000_0000_1111_1111_1111_1111
    ) + stringifyU16s(u16s)
  );
}

function stringifyU16s(u16s: number[]): string {
  try {
    // This will crash in some browsers if
    // `u16s` is too large.
    return String.fromCharCode(...u16s);
  } catch {
    let out = "";

    for (let i = 0; i < u16s.length; i++) {
      out += String.fromCharCode(u16s[i]);
    }

    return out;
  }
}
