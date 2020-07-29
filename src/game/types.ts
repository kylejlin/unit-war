import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export interface Agent {
  /**
   * Returns a `Float64Array` containing the
   * initial bid (at index `0`) and the max
   * bid (at index `1`).
   *
   * Implementations of this method are responsible
   * for ensuring that both
   * bids are less than or equal to `1`.
   */
  lead: (strength: number, noise: number) => ReadonlyFloat64Array;

  /**
   * Implementations of this method are responsible
   * for ensuring that returned value is less than
   * or equal to `1`.
   */
  follow: (strength: number, initialBid: number, noise: number) => number;

  toArrayBuffer(): ArrayBuffer;
}

export interface TrainableAgent extends Agent {
  train: (opponent: Agent, options: TrainingOptions) => void;
}

export interface TrainingOptions {
  derivativeStep: number;
  learningRate: number;
  evaluationOptions: EvaluationOptions;
}

export interface EvaluationOptions {
  hands: number;
  ante: number;
}
