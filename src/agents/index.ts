import { Agent } from "../game/types";
import {
  AgentArtichoke,
  areArtichokeCreationOptionsValid,
  ArtichokeCreationOptions,
} from "./artichoke";
import {
  AgentBroccoli,
  areBroccoliOptionsValid,
  BroccoliCreationOptions,
} from "./broccoli";

export enum AgentType {
  Artichoke = 1,
  Broccoli = 2,
}

export type AgentCreationOptions =
  | ArtichokeCreationOptions
  | BroccoliCreationOptions;

export const ALL_AGENT_TYPES: AgentType[] = [
  AgentType.Artichoke,
  AgentType.Broccoli,
];

export function deserializeAgent(buffer: ArrayBuffer): Agent {
  const agentType = new Float64Array(buffer)[0];

  switch (agentType) {
    case AgentType.Artichoke:
      return AgentArtichoke.fromArrayBuffer(buffer);
    case AgentType.Broccoli:
      return AgentBroccoli.fromArrayBuffer(buffer);

    default:
      throw new TypeError("Cannot recognize AgentType: " + agentType);
  }
}

export function createAgent(
  agentType: AgentType,
  creationOptions: AgentCreationOptions
): Agent {
  switch (agentType) {
    case AgentType.Artichoke:
      return AgentArtichoke.fromCreationOptions(
        creationOptions as ArtichokeCreationOptions
      );
    case AgentType.Broccoli:
      return AgentBroccoli.fromCreationOptions(
        creationOptions as BroccoliCreationOptions
      );
  }
}

export function getAgentTypeDisplayString(agentType: AgentType): string {
  return AgentType[agentType];
}

export function getDefaultAgentCreationOptions(
  agentType: AgentType
): AgentCreationOptions {
  switch (agentType) {
    case AgentType.Artichoke:
      return { hiddenLayerSize: 16 };
    case AgentType.Broccoli:
      return {};
  }
}

export function areAgentCreationOptionsValid(
  agentType: AgentType,
  options: AgentCreationOptions
): boolean {
  switch (agentType) {
    case AgentType.Artichoke:
      return areArtichokeCreationOptionsValid(
        options as ArtichokeCreationOptions
      );
    case AgentType.Broccoli:
      return areBroccoliOptionsValid(options as BroccoliCreationOptions);
  }
}

export function cloneAgent(agent: Agent): Agent {
  return deserializeAgent(agent.toArrayBuffer());
}
