import { AgentType } from "../agents";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export interface Agent {
  readonly agentType: AgentType;

  /**
   * Returns a `Float64Array` containing the
   * initial bet (at index `0`) and the max
   * bet (at index `1`).
   *
   * Implementations of this method are responsible
   * for ensuring that both
   * bets are less than or equal to `1`.
   */
  lead: (strength: number, noise: number) => ReadonlyFloat64Array;

  /**
   * Implementations of this method are responsible
   * for ensuring that returned value is less than
   * or equal to `1`.
   */
  follow: (strength: number, initialBet: number, noise: number) => number;

  toArrayBuffer: () => ArrayBuffer;

  train: (opponent: Agent, options: TrainingCycleOptions) => void;
}

export interface TrainingCycleOptions {
  derivativeStep: number;
  learningRate: number;
  evaluationOptions: EvaluationOptions;
}

export interface EvaluationOptions {
  hands: number;
  ante: number;
}
