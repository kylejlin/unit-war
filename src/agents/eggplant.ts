import { AgentType } from ".";
import { Agent } from "../game/types";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export interface EggplantCreationOptions {}

export function areEggplantOptionsValid(
  _options: EggplantCreationOptions
): boolean {
  return true;
}

export class AgentEggplant implements Agent {
  readonly agentType: AgentType.Eggplant;

  private readonly leadOutput: Float64Array;

  static fromCreationOptions(options: EggplantCreationOptions): Agent {
    return new AgentEggplant();
  }

  static fromArrayBuffer(_buffer: ArrayBuffer): Agent {
    return new AgentEggplant();
  }

  private constructor() {
    this.agentType = AgentType.Eggplant;

    this.leadOutput = new Float64Array(2);
  }

  lead(strength: number): ReadonlyFloat64Array {
    const { leadOutput } = this;
    leadOutput[0] = strength;
    leadOutput[1] = strength > 0.5 ? 1 : 0;
    return leadOutput;
  }

  follow(strength: number, initialBet: number): number {
    if (strength > 0.5) {
      return Math.max(strength, initialBet);
    } else {
      return strength;
    }
  }

  train(): void {}

  toArrayBuffer(): ArrayBuffer {
    return new Float64Array([AgentType.Eggplant]).buffer;
  }
}
