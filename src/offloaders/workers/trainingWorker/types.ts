import { TrainingCycleOptions } from "../../../game/types";
import { RelativeReward } from "../../../types/state";

export enum TrainingWorkerMessageType {
  Start,
  CycleComplete,
  Done,
}

export interface StartRequest {
  messageType: TrainingWorkerMessageType.Start;

  namedTraineeBuffer: NamedAgentBuffer;
  namedOpponentBuffers: NamedAgentBuffer[];
  trainingCycles: number;
  trainingCycleOptions: TrainingCycleOptions;
}

export interface NamedAgentBuffer {
  agentName: string;
  buffer: ArrayBuffer;
}

export type TrainingWorkerNotification =
  | CycleCompleteNotification
  | DoneNotification;

export interface CycleCompleteNotification {
  messageType: TrainingWorkerMessageType.CycleComplete;

  cycleNumber: number;
  namedTraineeBuffer: NamedAgentBuffer;
  relativeRewards: RelativeReward[];
}

export interface DoneNotification {
  messageType: TrainingWorkerMessageType.Done;
}
