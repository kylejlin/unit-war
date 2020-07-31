import { Agent, EvaluationOptions } from "../game/types";
import { evaluate } from "../game/evaluate";
import EvaluationWorker from "./workers/evaluationWorker/evaluationWorker.importable";
import {
  EvaluationWorkerMessageType,
  DoneNotification,
} from "./workers/evaluationWorker/types";

export function promisifiedEvaluate(
  a: Agent,
  b: Agent,
  evaluationOptions: EvaluationOptions,
  useMainThread: boolean
): Promise<number> {
  if (useMainThread) {
    return evaluateOnMainThread(a, b, evaluationOptions);
  } else {
    return evaluateOnWorker(a, b, evaluationOptions);
  }
}

function evaluateOnMainThread(
  a: Agent,
  b: Agent,
  evaluationOptions: EvaluationOptions
): Promise<number> {
  return new Promise((resolve) => {
    resolve(evaluate(a, b, evaluationOptions));
  });
}

function evaluateOnWorker(
  a: Agent,
  b: Agent,
  evaluationOptions: EvaluationOptions
): Promise<number> {
  return new Promise((resolve) => {
    const aBuffer = a.toArrayBuffer();
    const bBuffer = b.toArrayBuffer();

    const worker = new EvaluationWorker();
    worker.addEventListener("message", (event) => {
      const notification: DoneNotification = event.data;
      resolve(notification.evaluation);
    });
    worker.postMessage(
      {
        messageType: EvaluationWorkerMessageType.Start,
        agentABuffer: aBuffer,
        agentBBuffer: bBuffer,
        evaluationOptions,
      },
      [aBuffer, bBuffer]
    );
  });
}
