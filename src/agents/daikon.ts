import { AgentType } from ".";
import { Agent } from "../game/types";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export interface DaikonCreationOptions {
  bet: number;
}

export function areDaikonOptionsValid(options: DaikonCreationOptions): boolean {
  const { bet } = options;
  return 0 <= bet && bet <= 1;
}

export class AgentDaikon implements Agent {
  readonly agentType: AgentType.Daikon;

  private readonly leadOutput: ReadonlyFloat64Array;

  private constructor(bet: number) {
    this.agentType = AgentType.Daikon;

    this.leadOutput = new Float64Array([bet, bet]);
  }

  static fromCreationOptions(options: DaikonCreationOptions): Agent {
    return new AgentDaikon(options.bet);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): Agent {
    const bet = new Float64Array(buffer)[1];
    return new AgentDaikon(bet);
  }

  lead(): ReadonlyFloat64Array {
    return this.leadOutput;
  }

  follow(): number {
    return this.leadOutput[0];
  }

  train(): void {}

  toArrayBuffer(): ArrayBuffer {
    const bet = this.leadOutput[0];
    return new Float64Array([AgentType.Daikon, bet]).buffer;
  }
}
