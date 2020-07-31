import { deserializeAgent } from "../agents";
import { evaluate } from "../game/evaluate";
import { decodeBytes, encodeBytes } from "../stateSavers/byteStringifier";

export function makeUtilsAccessibleForDebug(): void {
  (window as any).encodeBytes = encodeBytes;
  (window as any).decodeBytes = decodeBytes;
  (window as any).deserializeAgent = deserializeAgent;

  (window as any).evaluate = evaluate;
}
