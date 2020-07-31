import { cloneAgent } from "../agents";
import { TrainingCycleOptions } from "../game/types";
import { NamedAgent, RelativeReward } from "../types/state";
import { evaluate } from "../game/evaluate";

export function trainAsync(
  traineeSource: NamedAgent,
  opponents: NamedAgent[],
  trainingCycles: number,
  options: TrainingCycleOptions,
  useMainThread: boolean,
  onCycleComplete: (
    cycleNumber: number,
    trainee: NamedAgent,
    relativeRewards: RelativeReward[],
    terminateTraining: () => void
  ) => void
): void {
  const trainee: NamedAgent = {
    name: traineeSource.name,
    agent: cloneAgent(traineeSource.agent),
  };

  if (useMainThread) {
    trainOnMainThread(
      trainee,
      opponents,
      trainingCycles,
      options,
      onCycleComplete
    );
  } else {
    trainOnWorker(trainee, opponents, trainingCycles, options, onCycleComplete);
  }
}

function trainOnMainThread(
  namedTrainee: NamedAgent,
  namedOpponents: NamedAgent[],
  trainingCycles: number,
  options: TrainingCycleOptions,
  onCycleComplete: (
    cycleNumber: number,
    trainee: NamedAgent,
    relativeRewards: RelativeReward[],
    terminateTraining: () => void
  ) => void
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

      onCycleComplete(cycleNumber, namedTrainee, relativeRewards, noOp);
    }
  }
}

function noOp(): void {}

function trainOnWorker(
  trainee: NamedAgent,
  opponents: NamedAgent[],
  trainingCycles: number,
  options: TrainingCycleOptions,
  onCycleComplete: (
    cycleNumber: number,
    trainee: NamedAgent,
    relativeRewards: RelativeReward[],
    terminateTraining: () => void
  ) => void
): void {
  // TODO
}
