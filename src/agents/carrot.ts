import { AgentType } from ".";
import { Agent } from "../game/types";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export interface CarrotCreationOptions {}

export function areCarrotOptionsValid(
  _options: CarrotCreationOptions
): boolean {
  return true;
}

export class AgentCarrot implements Agent {
  readonly agentType: AgentType.Carrot;

  private readonly leadOutput: Float64Array;

  static fromCreationOptions(options: CarrotCreationOptions): Agent {
    return new AgentCarrot();
  }

  static fromArrayBuffer(_buffer: ArrayBuffer): Agent {
    return new AgentCarrot();
  }

  private constructor() {
    this.agentType = AgentType.Carrot;

    this.leadOutput = new Float64Array(2);
  }

  lead(strength: number): ReadonlyFloat64Array {
    const { leadOutput } = this;
    leadOutput[0] = strength;
    leadOutput[1] = strength;
    return leadOutput;
  }

  follow(strength: number): number {
    return strength;
  }

  train(): void {}

  toArrayBuffer(): ArrayBuffer {
    return new Float64Array([AgentType.Carrot]).buffer;
  }
}
