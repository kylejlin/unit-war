import { deserializeAgent } from "../../../agents";
import { evaluate } from "../../../game/evaluate";
import { TrainingCycleOptions } from "../../../game/types";
import { NamedAgent, RelativeReward } from "../../../types/state";
import {
  CycleCompleteNotification,
  DoneNotification,
  StartRequest,
  TrainingWorkerMessageType,
  TrainingWorkerNotification,
} from "./types";

interface Self {
  postMessage(
    message: TrainingWorkerNotification,
    transfers?: Transferable[]
  ): void;
  addEventListener: Worker["addEventListener"];
}

declare const self: Self;

export {};

self.addEventListener("message", (event) => {
  const { data } = event;
  if ("object" === typeof data && data !== null) {
    if (data.messageType === TrainingWorkerMessageType.Start) {
      decodeDataAndStartTraining(data);
    }
  }
});

function decodeDataAndStartTraining(data: StartRequest): void {
  const namedTrainee: NamedAgent = {
    name: data.namedTraineeBuffer.agentName,
    agent: deserializeAgent(data.namedTraineeBuffer.buffer),
  };
  const namedOpponents: NamedAgent[] = data.namedOpponentBuffers.map(
    ({ agentName, buffer }) => ({
      name: agentName,
      agent: deserializeAgent(buffer),
    })
  );
  const { trainingCycles, trainingCycleOptions } = data;

  startTraining(
    namedTrainee,
    namedOpponents,
    trainingCycles,
    trainingCycleOptions
  );
}

function startTraining(
  namedTrainee: NamedAgent,
  namedOpponents: NamedAgent[],
  trainingCycles: number,
  options: TrainingCycleOptions
): void {
  const trainee = namedTrainee.agent;
  const opponents = namedOpponents.map(({ agent }) => agent);
  const opponentNames = namedOpponents.map(({ name }) => name);

  const opponentCount = namedOpponents.length;
  const { evaluationOptions } = options;

  for (let cycleNumber = 0; cycleNumber < trainingCycles; cycleNumber++) {
    {
      const relativeRewards = new Float64Array(opponentCount);

      for (
        let opponentIndex = 0;
        opponentIndex < opponentCount;
        opponentIndex++
      ) {
        const opponent = opponents[opponentIndex];
        relativeRewards[opponentIndex] = evaluate(
          trainee,
          opponent,
          evaluationOptions
        );
      }

      let strongestOpponentIndex = 0;
      let lowestRelativeReward = relativeRewards[0];
      for (
        let opponentIndex = 1;
        opponentIndex < opponentCount;
        opponentIndex++
      ) {
        const reward = relativeRewards[opponentIndex];
        if (reward < lowestRelativeReward) {
          lowestRelativeReward = reward;
          strongestOpponentIndex = opponentIndex;
        }
      }

      const strongestOpponent = opponents[strongestOpponentIndex];
      trainee.train(strongestOpponent, options);
    }

    {
      const relativeRewards: RelativeReward[] = new Array(opponentCount);

      for (
        let opponentIndex = 0;
        opponentIndex < opponentCount;
        opponentIndex++
      ) {
        const opponent = opponents[opponentIndex];
        relativeRewards[opponentIndex] = {
          opponentName: opponentNames[opponentIndex],
          reward: evaluate(trainee, opponent, evaluationOptions),
        };
      }

      onCycleComplete(cycleNumber, namedTrainee, relativeRewards);
    }
  }

  onDoneTraining();
}

function onCycleComplete(
  cycleNumber: number,
  trainee: NamedAgent,
  relativeRewards: RelativeReward[]
): void {
  const traineeBuffer = trainee.agent.toArrayBuffer();
  const namedTraineeBuffer = { agentName: trainee.name, buffer: traineeBuffer };
  const message: CycleCompleteNotification = {
    messageType: TrainingWorkerMessageType.CycleComplete,

    cycleNumber,
    namedTraineeBuffer,
    relativeRewards,
  };
  self.postMessage(message, [traineeBuffer]);
}

function onDoneTraining(): void {
  const message: DoneNotification = {
    messageType: TrainingWorkerMessageType.Done,
  };
  self.postMessage(message);
}
