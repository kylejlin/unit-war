import { Agent } from "../game/types";
import {
  AgentArtichoke,
  areArtichokeCreationOptionsValid,
  ArtichokeCreationOptions,
} from "./artichoke";

export enum AgentType {
  Artichoke = 1,
}

export type AgentCreationOptions = ArtichokeCreationOptions;

export const ALL_AGENT_TYPES: AgentType[] = [AgentType.Artichoke];

export function deserializeAgent(buffer: ArrayBuffer): Agent {
  const agentType = new Float64Array(buffer)[0];

  switch (agentType) {
    case AgentType.Artichoke:
      return AgentArtichoke.fromArrayBuffer(buffer);

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
      return AgentArtichoke.fromCreationOptions(creationOptions);
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
  }
}
