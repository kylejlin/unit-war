import { AgentType } from ".";
import { Agent } from "../game/types";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";
import { splitRandomVariable } from "../splitRandomVariable";

export interface BroccoliCreationOptions {}

export function areBroccoliOptionsValid(
  _options: BroccoliCreationOptions
): boolean {
  return true;
}

export class AgentBroccoli implements Agent {
  readonly agentType: AgentType.Broccoli;

  private readonly leadOutput: Float64Array;

  static fromCreationOptions(options: BroccoliCreationOptions): Agent {
    return new AgentBroccoli();
  }

  static fromArrayBuffer(_buffer: ArrayBuffer): Agent {
    return new AgentBroccoli();
  }

  private constructor() {
    this.agentType = AgentType.Broccoli;

    this.leadOutput = new Float64Array(2);
  }

  lead(_strength: number, noise: number): ReadonlyFloat64Array {
    const { leadOutput } = this;
    splitRandomVariable(noise, leadOutput);
    return leadOutput;
  }

  follow(_strength: number, _initialBet: number, noise: number): number {
    return noise;
  }

  train(): void {}

  toArrayBuffer(): ArrayBuffer {
    return new Float64Array([AgentType.Broccoli]).buffer;
  }
}
