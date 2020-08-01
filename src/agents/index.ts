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
import {
  AgentCarrot,
  areCarrotOptionsValid,
  CarrotCreationOptions,
} from "./carrot";
import {
  AgentDaikon,
  areDaikonOptionsValid,
  DaikonCreationOptions,
} from "./daikon";
import {
  AgentEggplant,
  areEggplantOptionsValid,
  EggplantCreationOptions,
} from "./eggplant";
import {
  AgentFig,
  areFigCreationOptionsValid,
  FigCreationOptions,
} from "./fig";

export enum AgentType {
  Artichoke = 1,
  Broccoli = 2,
  Carrot = 3,
  Daikon = 4,
  Eggplant = 5,
  Fig = 6,
}

export type AgentCreationOptions =
  | ArtichokeCreationOptions
  | BroccoliCreationOptions
  | CarrotCreationOptions
  | DaikonCreationOptions
  | EggplantCreationOptions
  | FigCreationOptions;

export const ALL_AGENT_TYPES: AgentType[] = [
  AgentType.Artichoke,
  AgentType.Broccoli,
  AgentType.Carrot,
  AgentType.Daikon,
  AgentType.Eggplant,
  AgentType.Fig,
];

export function deserializeAgent(buffer: ArrayBuffer): Agent {
  const agentType = new Float64Array(buffer)[0];

  if (isValidAgentType(agentType)) {
    return deserializeAgentOfType(buffer, agentType);
  } else {
    throw new TypeError("Cannot recognize AgentType: " + agentType);
  }
}

function isValidAgentType(n: number): n is AgentType {
  return ALL_AGENT_TYPES.includes(n);
}

function deserializeAgentOfType(
  buffer: ArrayBuffer,
  agentType: AgentType
): Agent {
  switch (agentType) {
    case AgentType.Artichoke:
      return AgentArtichoke.fromArrayBuffer(buffer);
    case AgentType.Broccoli:
      return AgentBroccoli.fromArrayBuffer(buffer);
    case AgentType.Carrot:
      return AgentCarrot.fromArrayBuffer(buffer);
    case AgentType.Daikon:
      return AgentDaikon.fromArrayBuffer(buffer);
    case AgentType.Eggplant:
      return AgentEggplant.fromArrayBuffer(buffer);
    case AgentType.Fig:
      return AgentFig.fromArrayBuffer(buffer);
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
    case AgentType.Carrot:
      return AgentCarrot.fromCreationOptions(
        creationOptions as CarrotCreationOptions
      );
    case AgentType.Daikon:
      return AgentDaikon.fromCreationOptions(
        creationOptions as DaikonCreationOptions
      );
    case AgentType.Eggplant:
      return AgentEggplant.fromCreationOptions(
        creationOptions as EggplantCreationOptions
      );
    case AgentType.Fig:
      return AgentFig.fromCreationOptions(
        creationOptions as FigCreationOptions
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
    case AgentType.Carrot:
      return {};
    case AgentType.Daikon:
      return { bet: 0.5 };
    case AgentType.Eggplant:
      return {};
    case AgentType.Fig:
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
    case AgentType.Broccoli:
      return areBroccoliOptionsValid(options as BroccoliCreationOptions);
    case AgentType.Carrot:
      return areCarrotOptionsValid(options as CarrotCreationOptions);
    case AgentType.Daikon:
      return areDaikonOptionsValid(options as DaikonCreationOptions);
    case AgentType.Eggplant:
      return areEggplantOptionsValid(options as EggplantCreationOptions);
    case AgentType.Fig:
      return areFigCreationOptionsValid(options as FigCreationOptions);
  }
}

export function cloneAgent(agent: Agent): Agent {
  return deserializeAgent(agent.toArrayBuffer());
}
