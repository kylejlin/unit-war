import { deserializeAgent } from "../../../agents";
import { evaluate } from "../../../game/evaluate";
import {
  DoneNotification,
  EvaluationWorkerMessageType,
  StartRequest,
} from "./types";

interface Self {
  postMessage(message: DoneNotification, transfers?: Transferable[]): void;
  addEventListener: Worker["addEventListener"];
}

declare const self: Self;

export {};

self.addEventListener("message", (event) => {
  const { data } = event;
  if ("object" === typeof data && data !== null) {
    if (data.messageType === EvaluationWorkerMessageType.Start) {
      startEvaluation(data);
    }
  }
});

function startEvaluation(request: StartRequest): void {
  const agentA = deserializeAgent(request.agentABuffer);
  const agentB = deserializeAgent(request.agentBBuffer);
  const evaluation = evaluate(agentA, agentB, request.evaluationOptions);
  self.postMessage({
    messageType: EvaluationWorkerMessageType.Done,
    evaluation,
  });
}
