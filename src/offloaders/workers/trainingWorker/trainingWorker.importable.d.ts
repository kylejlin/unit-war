import { StartRequest } from "./types";

export default class TrainingWorker {
  postMessage(message: StartRequest, transfers?: Transferable[]): void;
  addEventListener: Worker["addEventListener"];
  terminate: Worker["terminate"];
}
