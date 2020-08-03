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
import {
  AgentGrape,
  areGrapeCreationOptionsValid,
  GrapeCreationOptions,
} from "./grape";
import {
  AgentHabanero,
  areHabaneroCreationOptionsValid,
  HabaneroCreationOptions,
} from "./habanero";

export enum AgentType {
  Artichoke = 1,
  Broccoli = 2,
  Carrot = 3,
  Daikon = 4,
  Eggplant = 5,
  Fig = 6,
  Grape = 7,
  Habanero = 8,
}

export type AgentCreationOptions =
  | ArtichokeCreationOptions
  | BroccoliCreationOptions
  | CarrotCreationOptions
  | DaikonCreationOptions
  | EggplantCreationOptions
  | FigCreationOptions
  | GrapeCreationOptions
  | HabaneroCreationOptions;

export const ALL_AGENT_TYPES: AgentType[] = [
  AgentType.Artichoke,
  AgentType.Broccoli,
  AgentType.Carrot,
  AgentType.Daikon,
  AgentType.Eggplant,
  AgentType.Fig,
  AgentType.Grape,
  AgentType.Habanero,
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
    case AgentType.Grape:
      return AgentGrape.fromArrayBuffer(buffer);
    case AgentType.Habanero:
      return AgentHabanero.fromArrayBuffer(buffer);
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
    case AgentType.Grape:
      return AgentGrape.fromCreationOptions(
        creationOptions as GrapeCreationOptions
      );
    case AgentType.Habanero:
      return AgentHabanero.fromCreationOptions(
        creationOptions as HabaneroCreationOptions
      );
  }
}

export function getAgentTypeDisplayString(agentType: AgentType): string {
  switch (agentType) {
    case AgentType.Artichoke:
      return "Artichoke [Neural Network]";
    case AgentType.Broccoli:
      return "Broccoli [Random]";
    case AgentType.Carrot:
      return "Carrot [Value]";
    case AgentType.Daikon:
      return "Daikon [Constant]";
    case AgentType.Eggplant:
      return "Eggplant [Value]";
    case AgentType.Fig:
      return "Fig [Neural Network]";
    case AgentType.Grape:
      return "Grape [Neural Network]";
    case AgentType.Habanero:
      return "Habanero [Neural Network]";
  }
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
    case AgentType.Grape:
      return { hiddenLayerSize: 16 };
    case AgentType.Habanero:
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
    case AgentType.Grape:
      return areGrapeCreationOptionsValid(options as GrapeCreationOptions);
    case AgentType.Habanero:
      return areHabaneroCreationOptionsValid(
        options as HabaneroCreationOptions
      );
  }
}

export function cloneAgent(agent: Agent): Agent {
  return deserializeAgent(agent.toArrayBuffer());
}
