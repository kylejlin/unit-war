import { AgentTypes } from ".";
import { evaluate } from "../game/evaluate";
import { Agent, TrainableAgent, TrainingCycleOptions } from "../game/types";
import { normalRandom } from "../random";
import { ReadonlyFloat64Array } from "../readonly/readonlyFloat64Array";

export class AgentArtichoke implements TrainableAgent {
  private readonly inputs: Float64Array;

  private constructor(
    private readonly leaderNetwork: Network,
    private readonly followerNetwork: Network
  ) {
    this.inputs = new Float64Array(3);
  }

  static fromHiddenLayerSize(hiddenSize: number): TrainableAgent {
    const leaderNetwork = Network.fromLayerSizes(2, hiddenSize, 2);
    const followerNetwork = Network.fromLayerSizes(3, hiddenSize, 1);
    return new AgentArtichoke(leaderNetwork, followerNetwork);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): TrainableAgent {
    const floats = new Float64Array(buffer);
    const leaderSize = floats[1];
    const followerSize = floats[2];
    const leaderNetwork = Network.fromArrayBuffer(
      floats.slice(3, 3 + leaderSize).buffer
    );
    const followerNetwork = Network.fromArrayBuffer(
      floats.slice(3 + leaderSize, 3 + leaderSize + followerSize).buffer
    );
    return new AgentArtichoke(leaderNetwork, followerNetwork);
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

  train(opponent: Agent, options: TrainingCycleOptions): void {
    this.leaderNetwork.train(this, opponent, options);
    this.followerNetwork.train(this, opponent, options);
  }

  toArrayBuffer(): ArrayBuffer {
    const leaderFloats = new Float64Array(this.leaderNetwork.toArrayBuffer());
    const followerFloats = new Float64Array(
      this.followerNetwork.toArrayBuffer()
    );
    const out = new Float64Array(
      3 + leaderFloats.length + followerFloats.length
    );

    out[0] = AgentTypes.Artichoke;
    out[1] = leaderFloats.length;
    out[2] = followerFloats.length;
    out.set(leaderFloats, 3);
    out.set(followerFloats, 3 + leaderFloats.length);

    return out.buffer;
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

  static fromArrayBuffer(buffer: ArrayBuffer): Network {
    const floats = new Float64Array(buffer);

    const inputSize = floats[0];
    const hiddenSize = floats[1];
    const outputSize = floats[2];

    const hiddenWeightsSize = hiddenSize * inputSize;
    const hiddenBiasesSize = hiddenSize;

    const hiddenWeights = floats.subarray(3, 3 + hiddenWeightsSize);
    const hiddenBiases = floats.subarray(
      3 + hiddenWeightsSize,
      3 + hiddenWeightsSize + hiddenBiasesSize
    );

    const outputWeightsSize = outputSize * hiddenSize;
    const outputBiasesSize = outputSize;

    const outputWeights = floats.subarray(
      3 + hiddenWeightsSize + hiddenBiasesSize,
      3 + hiddenWeightsSize + hiddenBiasesSize + outputWeightsSize
    );
    const outputBiases = floats.subarray(
      3 + hiddenWeightsSize + hiddenBiasesSize + outputWeightsSize,
      3 +
        hiddenWeightsSize +
        hiddenBiasesSize +
        outputWeightsSize +
        outputBiasesSize
    );

    const network = new Network(inputSize, hiddenSize, outputSize);
    network.hiddenWeights.set(hiddenWeights);
    network.hiddenBiases.set(hiddenBiases);
    network.outputWeights.set(outputWeights);
    network.outputBiases.set(outputBiases);

    return network;
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
    options: TrainingCycleOptions
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

  toArrayBuffer(): ArrayBuffer {
    const {
      inputSize,
      hiddenSize,
      outputSize,

      hiddenWeights,
      hiddenBiases,

      outputWeights,
      outputBiases,
    } = this;

    const floats = new Float64Array(
      3 +
        hiddenWeights.length +
        hiddenBiases.length +
        outputWeights.length +
        outputBiases.length
    );

    floats[0] = inputSize;
    floats[1] = hiddenSize;
    floats[2] = outputSize;

    floats.set(hiddenWeights, 3);
    floats.set(hiddenBiases, 3 + hiddenWeights.length);

    floats.set(outputWeights, 3 + hiddenWeights.length + hiddenBiases.length);
    floats.set(
      outputBiases,
      3 + hiddenWeights.length + hiddenBiases.length + outputWeights.length
    );

    return floats.buffer;
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
