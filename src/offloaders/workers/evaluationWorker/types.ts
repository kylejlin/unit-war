import { EvaluationOptions } from "../../../game/types";

export enum EvaluationWorkerMessageType {
  Start,
  Done,
}

export interface StartRequest {
  messageType: EvaluationWorkerMessageType.Start;

  agentABuffer: ArrayBuffer;
  agentBBuffer: ArrayBuffer;
  evaluationOptions: EvaluationOptions;
}

export interface DoneNotification {
  messageType: EvaluationWorkerMessageType.Done;

  evaluation: number;
}
