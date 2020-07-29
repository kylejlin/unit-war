import { Agent } from "../game/types";
import { AgentArtichoke } from "./artichoke";

export enum AgentUids {
  Artichoke = 1,
}

export function deserializeAgent(buffer: ArrayBuffer): Agent {
  const uid = new Float64Array(buffer)[0];

  switch (uid) {
    case AgentUids.Artichoke:
      return AgentArtichoke.fromArrayBuffer(buffer);

    default:
      throw new TypeError("Cannot recognize Agent UID: " + uid);
  }
}
