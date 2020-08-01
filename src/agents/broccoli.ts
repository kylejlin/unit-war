import { AgentType } from ".";
import { Agent } from "../game/types";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export interface BroccoliCreationOptions {}

export function areBroccoliOptionsValid(
  _options: BroccoliCreationOptions
): boolean {
  return true;
}

const _2_POW_32 = 2 ** 32;
const _2_POW_16 = 2 ** 16;

export class AgentBroccoli implements Agent {
  readonly agentType: AgentType.Broccoli;

  private readonly splitterIn: Uint32Array;
  private readonly splitterOut: Uint16Array;

  private readonly leadOutput: Float64Array;

  static fromCreationOptions(options: BroccoliCreationOptions): Agent {
    return new AgentBroccoli();
  }

  static fromArrayBuffer(_buffer: ArrayBuffer): Agent {
    return new AgentBroccoli();
  }

  private constructor() {
    this.agentType = AgentType.Broccoli;

    const buffer = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
    this.splitterIn = new Uint32Array(buffer);
    this.splitterOut = new Uint16Array(buffer);

    this.leadOutput = new Float64Array(2);
  }

  lead(_strength: number, noise: number): ReadonlyFloat64Array {
    const { splitterIn, splitterOut, leadOutput } = this;
    splitterIn[0] = noise * _2_POW_32;
    leadOutput[0] = splitterOut[0] / _2_POW_16;
    leadOutput[1] = splitterOut[1] / _2_POW_16;
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
