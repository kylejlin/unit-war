import { Agent } from "../game/types";
import { AgentArtichoke } from "./artichoke";

export enum AgentTypes {
  Artichoke = 1,
}

export function deserializeAgent(buffer: ArrayBuffer): Agent {
  const agentType = new Float64Array(buffer)[0];

  switch (agentType) {
    case AgentTypes.Artichoke:
      return AgentArtichoke.fromArrayBuffer(buffer);

    default:
      throw new TypeError("Cannot recognize AgentType: " + agentType);
  }
}
