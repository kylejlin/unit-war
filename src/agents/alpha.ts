import { evaluate } from "../game/evaluate";
import { Agent, TrainableAgent, TrainingOptions } from "../game/types";
import { normalRandom } from "../random";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export class AgentAlpha implements TrainableAgent {
  private readonly leaderNetwork: Network;
  private readonly followerNetwork: Network;

  private readonly inputs: Float64Array;

  static fromHiddenLayerSize(hiddenSize: number): TrainableAgent {
    return new AgentAlpha(hiddenSize);
  }

  private constructor(hiddenSize: number) {
    this.leaderNetwork = Network.fromLayerSizes(2, hiddenSize, 2);
    this.followerNetwork = Network.fromLayerSizes(3, hiddenSize, 1);
    this.inputs = new Float64Array(3);
  }

  lead(strength: number, noise: number): ReadonlyFloat64Array {
    const { inputs } = this;
    inputs[0] = strength;
    inputs[1] = noise;
    return this.leaderNetwork.evaluate(inputs);
  }

  follow(strength: number, initialBid: number, noise: number): number {
    const { inputs } = this;
    inputs[0] = strength;
    inputs[1] = initialBid;
    inputs[2] = noise;
    return this.followerNetwork.evaluate(inputs)[0];
  }

  train(opponent: Agent, options: TrainingOptions): void {
    this.leaderNetwork.train(this, opponent, options);
    this.followerNetwork.train(this, opponent, options);
  }
}

class Network {
  private readonly buffer: ArrayBuffer;

  private readonly inputSize: number;
  private readonly hiddenSize: number;
  private readonly outputSize: number;

  private readonly hiddenWeights: Float64Array;
  private readonly hiddenBiases: Float64Array;
  private readonly hiddenActivations: Float64Array;

  private readonly outputWeights: Float64Array;
  private readonly outputBiases: Float64Array;
  private readonly outputActivations: Float64Array;

  private readonly updatedHiddenWeights: Float64Array;
  private readonly updatedHiddenBiases: Float64Array;

  private readonly updatedOutputWeights: Float64Array;
  private readonly updatedOutputBiases: Float64Array;

  static fromLayerSizes(
    inputSize: number,
    hiddenSize: number,
    outputSize: number
  ): Network {
    return new Network(inputSize, hiddenSize, outputSize);
  }

  private constructor(
    inputSize: number,
    hiddenSize: number,
    outputSize: number
  ) {
    const hiddenWeightsSize = hiddenSize * inputSize;
    const hiddenBiasesSize = hiddenSize;
    const hiddenActivationsSize = hiddenSize;
    const outputWeightsSize = outputSize * hiddenSize;
    const outputBiasesSize = outputSize;
    const outputActivationsSize = outputSize;
    const buffer = new ArrayBuffer(
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize +
          outputBiasesSize +
          outputActivationsSize +
          hiddenWeightsSize +
          hiddenBiasesSize +
          outputWeightsSize +
          outputBiasesSize)
    );
    this.buffer = buffer;

    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;

    this.hiddenWeights = new Float64Array(buffer, 0, hiddenWeightsSize);
    this.hiddenBiases = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT * hiddenWeightsSize,
      hiddenBiasesSize
    );
    this.hiddenActivations = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT * (hiddenWeightsSize + hiddenBiasesSize),
      hiddenActivationsSize
    );

    this.outputWeights = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize + hiddenBiasesSize + hiddenActivationsSize),
      outputWeightsSize
    );
    this.outputBiases = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize),
      outputBiasesSize
    );
    this.outputActivations = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize +
          outputBiasesSize),
      outputActivationsSize
    );

    this.updatedHiddenWeights = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize +
          outputBiasesSize +
          outputActivationsSize),
      hiddenWeightsSize
    );
    this.updatedHiddenBiases = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize +
          outputBiasesSize +
          outputActivationsSize +
          hiddenWeightsSize),
      hiddenBiasesSize
    );

    this.updatedOutputWeights = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize +
          outputBiasesSize +
          outputActivationsSize +
          hiddenWeightsSize +
          hiddenBiasesSize),
      outputWeightsSize
    );
    this.updatedOutputBiases = new Float64Array(
      buffer,
      Float64Array.BYTES_PER_ELEMENT *
        (hiddenWeightsSize +
          hiddenBiasesSize +
          hiddenActivationsSize +
          outputWeightsSize +
          outputBiasesSize +
          outputActivationsSize +
          hiddenWeightsSize +
          hiddenBiasesSize +
          outputWeightsSize),
      outputBiasesSize
    );

    this.initializeWeights();
  }

  private initializeWeights(): void {
    initializeWeights(this.hiddenWeights, this.inputSize);
    initializeWeights(this.outputWeights, this.hiddenSize);
  }

  evaluate(input: ReadonlyFloat64Array): ReadonlyFloat64Array {
    const {
      inputSize,
      hiddenSize,
      outputSize,

      hiddenWeights,
      hiddenBiases,
      hiddenActivations,

      outputWeights,
      outputBiases,
      outputActivations,
    } = this;

    for (let hiddenIndex = 0; hiddenIndex < hiddenSize; hiddenIndex++) {
      let dot = 0;

      for (let inputIndex = 0; inputIndex < inputSize; inputIndex++) {
        dot +=
          hiddenWeights[hiddenIndex * inputSize + inputIndex] *
          input[inputIndex];
      }

      hiddenActivations[hiddenIndex] = relu(dot + hiddenBiases[hiddenIndex]);
    }

    for (let outputIndex = 0; outputIndex < outputSize; outputIndex++) {
      let dot = 0;

      for (let hiddenIndex = 0; hiddenIndex < hiddenSize; hiddenIndex++) {
        dot +=
          outputWeights[outputIndex * hiddenSize + hiddenIndex] *
          hiddenActivations[hiddenIndex];
      }

      outputActivations[outputIndex] = sigmoid(dot + outputBiases[outputIndex]);
    }

    return outputActivations;
  }

  train(
    containingAgent: Agent,
    opponent: Agent,
    options: TrainingOptions
  ): void {
    const { evaluationOptions } = options;
    const baseline = evaluate(containingAgent, opponent, evaluationOptions);

    const {
      hiddenWeights,
      updatedHiddenWeights,
      hiddenBiases,
      updatedHiddenBiases,

      outputWeights,
      updatedOutputWeights,
      outputBiases,
      updatedOutputBiases,
    } = this;

    const { derivativeStep, learningRate } = options;

    const numberOfHiddenWeights = hiddenWeights.length;
    for (let i = 0; i < numberOfHiddenWeights; i++) {
      const originalWeight = hiddenWeights[i];
      hiddenWeights[i] += derivativeStep;
      const evaluation = evaluate(containingAgent, opponent, evaluationOptions);
      const derivative = (evaluation - baseline) / derivativeStep;
      updatedHiddenWeights[i] = originalWeight + derivative * learningRate;
      hiddenWeights[i] = originalWeight;
    }

    const numberOfHiddenBiases = hiddenBiases.length;
    for (let i = 0; i < numberOfHiddenBiases; i++) {
      const originalBias = hiddenBiases[i];
      hiddenBiases[i] += derivativeStep;
      const evaluation = evaluate(containingAgent, opponent, evaluationOptions);
      const derivative = (evaluation - baseline) / derivativeStep;
      updatedHiddenBiases[i] = originalBias + derivative * learningRate;
      hiddenBiases[i] = originalBias;
    }

    const numberOfOutputWeights = outputWeights.length;
    for (let i = 0; i < numberOfOutputWeights; i++) {
      const originalWeight = outputWeights[i];
      outputWeights[i] += derivativeStep;
      const evaluation = evaluate(containingAgent, opponent, evaluationOptions);
      const derivative = (evaluation - baseline) / derivativeStep;
      updatedOutputWeights[i] = originalWeight + derivative * learningRate;
      outputWeights[i] = originalWeight;
    }

    const numberOfOutputBiases = outputBiases.length;
    for (let i = 0; i < numberOfOutputBiases; i++) {
      const originalBias = outputBiases[i];
      outputBiases[i] += derivativeStep;
      const evaluation = evaluate(containingAgent, opponent, evaluationOptions);
      const derivative = (evaluation - baseline) / derivativeStep;
      updatedOutputBiases[i] = originalBias + derivative * learningRate;
      outputBiases[i] = originalBias;
    }

    hiddenWeights.set(updatedHiddenWeights);
    hiddenBiases.set(updatedHiddenBiases);
    outputWeights.set(updatedOutputWeights);
    outputBiases.set(updatedOutputBiases);
  }
}

function initializeWeights(weights: Float64Array, inputSize: number): void {
  for (let i = 0; i < weights.length; i++) {
    weights[i] = normalRandom(0, 1 / Math.sqrt(inputSize));
  }
}

function relu(n: number): number {
  return Math.max(0, n);
}

function sigmoid(n: number): number {
  return 1 / (1 + Math.exp(-n));
}
