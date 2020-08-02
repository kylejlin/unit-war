/**
 * Transforms a uniformly distributed
 * random variable on `[0, 1)` into two uniformly
 * distributed random variables (also on `[0, 1)`).
 *
 * The two output variables are written into the provided
 * `Float64Array`.
 */
export const splitRandomVariable: (
  random: number,
  out: Float64Array
) => void = isBigEndian() ? splitBigEndian : splitLittleEndian;

function isBigEndian(): boolean {
  const u32 = new Uint32Array([0xaabb_ccdd]);
  const u16 = new Uint16Array(u32.buffer);
  if (u16[0] === 0xaabb && u16[1] === 0xccdd) {
    return true;
  } else if (u16[1] === 0xaabb && u16[0] === 0xccdd) {
    return false;
  } else {
    throw new Error("Could not detect endianness.");
  }
}

const _2_POW_32 = 2 ** 32;
const _2_POW_16 = 2 ** 16;

const splitterIn = new Uint32Array(1);
const splitterOut = new Uint16Array(splitterIn.buffer);

function splitBigEndian(random: number, out: Float64Array): void {
  splitterIn[0] = random * _2_POW_32;
  out[0] = splitterOut[0] / _2_POW_16;
  out[1] = splitterOut[1] / _2_POW_16;
}

function splitLittleEndian(random: number, out: Float64Array): void {
  splitterIn[0] = random * _2_POW_32;
  out[0] = splitterOut[1] / _2_POW_16;
  out[1] = splitterOut[0] / _2_POW_16;
}
