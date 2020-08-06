import { AgentType } from ".";
import { Agent } from "../game/types";
import { isOnInclusiveUnitInterval } from "../numberValidation";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";
import { splitRandomVariable } from "../splitRandomVariable";

export interface IlamaCreationOptions {
  minStrength: number;
}

export function areIlamaOptionsValid(options: IlamaCreationOptions): boolean {
  return isOnInclusiveUnitInterval(options.minStrength);
}

export class AgentIlama implements Agent {
  readonly agentType: AgentType.Ilama;

  private readonly leadOutput: Float64Array;

  static fromCreationOptions(options: IlamaCreationOptions): Agent {
    return new AgentIlama(options.minStrength);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): Agent {
    const minStrength = new Float64Array(buffer)[1];
    return new AgentIlama(minStrength);
  }

  private constructor(private readonly minStrength: number) {
    this.agentType = AgentType.Ilama;

    this.leadOutput = new Float64Array(2);
  }

  lead(strength: number, noise: number): ReadonlyFloat64Array {
    const { leadOutput } = this;
    splitRandomVariable(noise, leadOutput);

    const isStrengthSufficient = strength >= this.minStrength;
    leadOutput[0] *= (isStrengthSufficient as unknown) as number;
    leadOutput[1] *= (isStrengthSufficient as unknown) as number;

    return leadOutput;
  }

  follow(strength: number, _initialBet: number, noise: number): number {
    return noise * (((strength > this.minStrength) as unknown) as number);
  }

  train(): void {}

  toArrayBuffer(): ArrayBuffer {
    return new Float64Array([AgentType.Ilama, this.minStrength]).buffer;
  }
}
