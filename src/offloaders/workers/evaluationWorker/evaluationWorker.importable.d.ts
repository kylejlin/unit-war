import { StartRequest } from "./types";

export default class EvaluationWorker {
  postMessage(message: StartRequest, transfers?: Transferable[]): void;
  addEventListener: Worker["addEventListener"];
  terminate: Worker["terminate"];
}
