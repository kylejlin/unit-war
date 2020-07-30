import React from "react";
import { getAgentTypeDisplayString } from "./agents";
import "./App.css";
import {
  isOnInclusiveUnitInterval,
  isPositiveFiniteNumber,
  isPositiveInteger,
} from "./numberValidation";
import { getSavedAgents } from "./stateSavers/agentsSaver";
import {
  getSavedAppOptions,
  saveAppOptions,
} from "./stateSavers/appOptionsSaver";
import {
  AgentListState,
  AppOptionInputValues,
  AppOptions,
  AppState,
  APP_OPTIONS_VERSION,
  EvaluationState,
  GraphState,
  OptionsState,
  PlayState,
  StateMap,
  StateType,
  TrainingAgentSelectionState,
  TrainingState,
} from "./types/state";

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = getInitialState();

    this.bindMethods();
  }

  bindMethods(): void {
    this.onOptionsClick = this.onOptionsClick.bind(this);
    this.onEvaluateClick = this.onEvaluateClick.bind(this);
    this.onTrainClick = this.onTrainClick.bind(this);
    this.onPlayClick = this.onPlayClick.bind(this);
    this.onGraphClick = this.onGraphClick.bind(this);

    this.onAgentListClick = this.onAgentListClick.bind(this);
    this.onTrainingCyclesInputValueChange = this.onTrainingCyclesInputValueChange.bind(
      this
    );
    this.onTrainingCycleDerivativeStepInputValueChange = this.onTrainingCycleDerivativeStepInputValueChange.bind(
      this
    );
    this.onTrainingCycleLearningRateInputValueChange = this.onTrainingCycleLearningRateInputValueChange.bind(
      this
    );
    this.onTrainingCycleEvaluationHandsInputValueChange = this.onTrainingCycleEvaluationHandsInputValueChange.bind(
      this
    );
    this.onTrainingCycleEvaluationAnteInputValueChange = this.onTrainingCycleEvaluationAnteInputValueChange.bind(
      this
    );
    this.onUseMainThreadChange = this.onUseMainThreadChange.bind(this);
  }

  expectState<T extends StateType>(expectedType: T): StateMap[T] {
    const { state } = this;
    if (state.stateType === expectedType) {
      return state as StateMap[T];
    }
    throw new Error(
      "Expected StateType." +
        StateType[expectedType] +
        " but got StateType." +
        StateType[state.stateType] +
        "."
    );
  }

  render(): React.ReactElement {
    const { state } = this;

    switch (state.stateType) {
      case StateType.AgentList:
        return this.renderAgentList(state);
      case StateType.Options:
        return this.renderOptionsMenu(state);
      case StateType.Evaluation:
        return this.renderEvaluationMenu(state);
      case StateType.TrainingAgentSelection:
        return this.renderTrainingAgentSelectionMenu(state);
      case StateType.Training:
        return this.renderTrainingMenu(state);
      case StateType.Play:
        return this.renderPlayMenu(state);
      case StateType.Graph:
        return this.renderGraphMenu(state);
    }
  }

  renderAgentList(state: AgentListState): React.ReactElement {
    const agents = state.agents
      .slice()
      .sort((a, b) => compareLexicographically(a.name, b.name));

    return (
      <div className="App">
        <section>
          <h2>Agents:</h2>

          <ul>
            {agents.map(({ name: agentName, agent }) => (
              <li key={agentName}>
                {agentName} ({getAgentTypeDisplayString(agent.agentType)})
              </li>
            ))}
          </ul>
        </section>

        <section>
          <button onClick={this.onOptionsClick}>Options</button>
          <button onClick={this.onEvaluateClick}>Evaluate</button>
          <button onClick={this.onTrainClick}>Train</button>
          <button onClick={this.onPlayClick}>Play</button>
          <button onClick={this.onGraphClick}>Graph</button>
        </section>
      </div>
    );
  }

  renderOptionsMenu(state: OptionsState): React.ReactElement {
    const { inputValues } = state;
    return (
      <div className="App">
        <section>
          {" "}
          <button onClick={this.onAgentListClick}>Back</button> <h2>Options</h2>
        </section>

        <section>
          <h3>Training</h3>
          <label>
            Training cycles:{" "}
            <input
              className={
                isPositiveInteger(+inputValues.trainingCycles)
                  ? ""
                  : "OptionInput--invalid"
              }
              type="text"
              value={inputValues.trainingCycles}
              onChange={this.onTrainingCyclesInputValueChange}
            />
          </label>
          <label>
            Derivative step:{" "}
            <input
              className={
                isPositiveFiniteNumber(
                  +inputValues.trainingCycleOptions.derivativeStep
                )
                  ? ""
                  : "OptionInput--invalid"
              }
              type="text"
              value={inputValues.trainingCycleOptions.derivativeStep}
              onChange={this.onTrainingCycleDerivativeStepInputValueChange}
            />
          </label>
          <label>
            Learning rate:{" "}
            <input
              className={
                isPositiveFiniteNumber(
                  +inputValues.trainingCycleOptions.learningRate
                )
                  ? ""
                  : "OptionInput--invalid"
              }
              type="text"
              value={inputValues.trainingCycleOptions.learningRate}
              onChange={this.onTrainingCycleLearningRateInputValueChange}
            />
          </label>
        </section>

        <section>
          <h3>Game</h3>
          <label>
            Hands:{" "}
            <input
              className={
                isPositiveInteger(
                  +inputValues.trainingCycleOptions.evaluationOptions.hands
                )
                  ? ""
                  : "OptionInput--invalid"
              }
              type="text"
              value={inputValues.trainingCycleOptions.evaluationOptions.hands}
              onChange={this.onTrainingCycleEvaluationHandsInputValueChange}
            />
          </label>
          <label>
            Ante:{" "}
            <input
              className={
                isOnInclusiveUnitInterval(
                  +inputValues.trainingCycleOptions.evaluationOptions.ante
                )
                  ? ""
                  : "OptionInput--invalid"
              }
              type="text"
              value={inputValues.trainingCycleOptions.evaluationOptions.ante}
              onChange={this.onTrainingCycleEvaluationAnteInputValueChange}
            />
          </label>
        </section>

        <section>
          <h3>Performance</h3>
          <label>
            Use main thread for expensive computations:{" "}
            <input
              type="checkbox"
              checked={state.options.useMainThreadForExpensiveComputation}
              onChange={this.onUseMainThreadChange}
            />
          </label>
        </section>
      </div>
    );
  }

  renderEvaluationMenu(state: EvaluationState): React.ReactElement {
    return <div className="App"></div>;
  }

  renderTrainingAgentSelectionMenu(
    state: TrainingAgentSelectionState
  ): React.ReactElement {
    return <div className="App"></div>;
  }

  renderTrainingMenu(state: TrainingState): React.ReactElement {
    return <div className="App"></div>;
  }

  renderPlayMenu(state: PlayState): React.ReactElement {
    return <div className="App"></div>;
  }

  renderGraphMenu(state: GraphState): React.ReactElement {
    return <div className="App"></div>;
  }

  onOptionsClick(): void {
    const { state } = this;
    const newState: OptionsState = {
      stateType: StateType.Options,

      agents: state.agents,
      options: state.options,

      inputValues: getInputValuesForAppOptions(state.options),
    };
    this.setState(newState);
  }

  onEvaluateClick(): void {
    // TODO
  }

  onTrainClick(): void {
    // TODO
  }

  onPlayClick(): void {
    // TODO
  }

  onGraphClick(): void {
    // TODO
  }

  onAgentListClick(): void {
    const { state } = this;
    const newState: AgentListState = {
      stateType: StateType.AgentList,

      agents: state.agents,
      options: state.options,
    };
    this.setState(newState);
  }

  onTrainingCyclesInputValueChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const state = this.expectState(StateType.Options);
    const inputValue = event.target.value;

    const inputValues: AppOptionInputValues = {
      ...state.inputValues,
      trainingCycles: inputValue,
    };

    if (isPositiveInteger(+inputValue)) {
      const options: AppOptions = {
        ...state.options,
        trainingCycles: +inputValue,
      };
      saveAppOptions(options);

      const newState: OptionsState = { ...state, inputValues, options };
      this.setState(newState);
    } else {
      const newState: OptionsState = { ...state, inputValues };
      this.setState(newState);
    }
  }

  onTrainingCycleDerivativeStepInputValueChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const state = this.expectState(StateType.Options);
    const inputValue = event.target.value;

    const inputValues: AppOptionInputValues = {
      ...state.inputValues,
      trainingCycleOptions: {
        ...state.inputValues.trainingCycleOptions,
        derivativeStep: inputValue,
      },
    };

    if (isPositiveFiniteNumber(+inputValue)) {
      const options: AppOptions = {
        ...state.options,
        trainingCycleOptions: {
          ...state.options.trainingCycleOptions,
          derivativeStep: +inputValue,
        },
      };
      saveAppOptions(options);

      const newState: OptionsState = { ...state, inputValues, options };
      this.setState(newState);
    } else {
      const newState: OptionsState = { ...state, inputValues };
      this.setState(newState);
    }
  }

  onTrainingCycleLearningRateInputValueChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const state = this.expectState(StateType.Options);
    const inputValue = event.target.value;

    const inputValues: AppOptionInputValues = {
      ...state.inputValues,
      trainingCycleOptions: {
        ...state.inputValues.trainingCycleOptions,
        learningRate: inputValue,
      },
    };

    if (isPositiveFiniteNumber(+inputValue)) {
      const options: AppOptions = {
        ...state.options,
        trainingCycleOptions: {
          ...state.options.trainingCycleOptions,
          learningRate: +inputValue,
        },
      };
      saveAppOptions(options);

      const newState: OptionsState = { ...state, inputValues, options };
      this.setState(newState);
    } else {
      const newState: OptionsState = { ...state, inputValues };
      this.setState(newState);
    }
  }

  onTrainingCycleEvaluationHandsInputValueChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const state = this.expectState(StateType.Options);
    const inputValue = event.target.value;

    const inputValues: AppOptionInputValues = {
      ...state.inputValues,
      trainingCycleOptions: {
        ...state.inputValues.trainingCycleOptions,
        evaluationOptions: {
          ...state.inputValues.trainingCycleOptions.evaluationOptions,
          hands: inputValue,
        },
      },
    };

    if (isPositiveInteger(+inputValue)) {
      const options: AppOptions = {
        ...state.options,
        trainingCycleOptions: {
          ...state.options.trainingCycleOptions,
          evaluationOptions: {
            ...state.options.trainingCycleOptions.evaluationOptions,
            hands: +inputValue,
          },
        },
      };
      saveAppOptions(options);

      const newState: OptionsState = { ...state, inputValues, options };
      this.setState(newState);
    } else {
      const newState: OptionsState = { ...state, inputValues };
      this.setState(newState);
    }
  }

  onTrainingCycleEvaluationAnteInputValueChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const state = this.expectState(StateType.Options);
    const inputValue = event.target.value;

    const inputValues: AppOptionInputValues = {
      ...state.inputValues,
      trainingCycleOptions: {
        ...state.inputValues.trainingCycleOptions,
        evaluationOptions: {
          ...state.inputValues.trainingCycleOptions.evaluationOptions,
          ante: inputValue,
        },
      },
    };

    if (isOnInclusiveUnitInterval(+inputValue)) {
      const options: AppOptions = {
        ...state.options,
        trainingCycleOptions: {
          ...state.options.trainingCycleOptions,
          evaluationOptions: {
            ...state.options.trainingCycleOptions.evaluationOptions,
            ante: +inputValue,
          },
        },
      };
      saveAppOptions(options);

      const newState: OptionsState = { ...state, inputValues, options };
      this.setState(newState);
    } else {
      const newState: OptionsState = { ...state, inputValues };
      this.setState(newState);
    }
  }

  onUseMainThreadChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const state = this.expectState(StateType.Options);

    const options: AppOptions = {
      ...state.options,
      useMainThreadForExpensiveComputation: event.target.checked,
    };
    saveAppOptions(options);

    const newState: OptionsState = { ...state, options };
    this.setState(newState);
  }
}

function getInitialState(): AppState {
  const agents = getSavedAgents() ?? [];
  const options = getSavedAppOptions() ?? getDefaultAppOptions();
  return {
    stateType: StateType.AgentList,

    agents,
    options,
  };
}

function getDefaultAppOptions(): AppOptions {
  return {
    version: APP_OPTIONS_VERSION,
    trainingCycles: 30,
    trainingCycleOptions: {
      derivativeStep: 0.001,
      learningRate: 0.1,
      evaluationOptions: {
        hands: 1000,
        ante: 0.001,
      },
    },
    useMainThreadForExpensiveComputation: false,
  };
}

/**
 * Using a lexicographical order on character codes,
 * returns a negative number if `a < b`, a positive
 * number if `a > b`, and `0` if `a === b`.
 */
function compareLexicographically(a: string, b: string): number {
  let i = 0;
  while (true) {
    if (i >= a.length) {
      if (i >= b.length) {
        return 0;
      } else {
        return -1;
      }
    }

    if (i >= b.length) {
      return 1;
    }

    const ca = a.charCodeAt(i);
    const cb = b.charCodeAt(i);
    const diff = ca - cb;
    if (diff !== 0) {
      return diff;
    }

    i++;
  }
}

function getInputValuesForAppOptions(
  options: AppOptions
): AppOptionInputValues {
  return {
    trainingCycles: "" + options.trainingCycles,
    trainingCycleOptions: {
      derivativeStep: "" + options.trainingCycleOptions.derivativeStep,
      learningRate: "" + options.trainingCycleOptions.learningRate,
      evaluationOptions: {
        hands: "" + options.trainingCycleOptions.evaluationOptions.hands,
        ante: "" + options.trainingCycleOptions.evaluationOptions.ante,
      },
    },
  };
}
