import React from "react";
import {
  AgentCreationOptions,
  AgentType,
  ALL_AGENT_TYPES,
  areAgentCreationOptionsValid,
  createAgent,
  getAgentTypeDisplayString,
  getDefaultAgentCreationOptions,
} from "./agents";
import { ArtichokeCreationOptions } from "./agents/artichoke";
import "./App.css";
import {
  isOnInclusiveUnitInterval,
  isPositiveFiniteNumber,
  isPositiveInteger,
} from "./numberValidation";
import { shuffle } from "./random";
import * as agentsSaver from "./stateSavers/agentsSaver";
import {
  getSavedAppOptions,
  saveAppOptions,
} from "./stateSavers/appOptionsSaver";
import {
  AgentCreationState,
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
  WithNumberValues,
  WithStringValues,
} from "./types/state";

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = getInitialState();

    this.bindMethods();
  }

  bindMethods(): void {
    this.onOptionsClick = this.onOptionsClick.bind(this);
    this.onCreateAgentClick = this.onCreateAgentClick.bind(this);
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

    this.onAgentNameChange = this.onAgentNameChange.bind(this);
    this.onAgentTypeChange = this.onAgentTypeChange.bind(this);
    this.onConfirmCreationClick = this.onConfirmCreationClick.bind(this);
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
      case StateType.AgentCreation:
        return this.renderAgentCreationMenu(state);
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
          <button onClick={this.onCreateAgentClick}>Create agent</button>
          <button disabled={agents.length === 0} onClick={this.onEvaluateClick}>
            Evaluate
          </button>
          <button disabled={agents.length === 0} onClick={this.onTrainClick}>
            Train
          </button>
          <button disabled={agents.length === 0} onClick={this.onPlayClick}>
            Play
          </button>
          <button disabled={agents.length === 0} onClick={this.onGraphClick}>
            Graph
          </button>
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
                  : "InvalidInput"
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
                  : "InvalidInput"
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
                  : "InvalidInput"
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
                  : "InvalidInput"
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
                  : "InvalidInput"
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

  renderAgentCreationMenu(state: AgentCreationState): React.ReactElement {
    const isAgentNameValid =
      state.agents.every(({ name }) => name !== state.agentName) &&
      /^[\w.\-,/()=]+(?:\s*[\w.\-,/()=]+)*$/.test(state.agentName);

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Back</button>
          <h2>Create agent</h2>
        </section>

        <section>
          <label>
            Agent name:{" "}
            <input
              className={isAgentNameValid ? "" : "InvalidInput"}
              type="text"
              value={state.agentName}
              onChange={this.onAgentNameChange}
            />
          </label>

          <label>
            Agent type:{" "}
            <select value={state.agentType} onChange={this.onAgentTypeChange}>
              {ALL_AGENT_TYPES.map((agentType) => (
                <option key={agentType} value={agentType}>
                  {getAgentTypeDisplayString(agentType)}
                </option>
              ))}
            </select>
          </label>

          {this.renderAgentParams(state)}

          <button
            disabled={
              !(
                isAgentNameValid &&
                areAgentCreationOptionsValid(
                  state.agentType,
                  withPropertyValuesParsedAsNumbers(
                    state.agentCreationOptionInputValues
                  )
                )
              )
            }
            onClick={this.onConfirmCreationClick}
          >
            Create
          </button>
        </section>
      </div>
    );
  }

  renderAgentParams(state: AgentCreationState): React.ReactElement {
    const inputValues: WithStringValues<ArtichokeCreationOptions> =
      state.agentCreationOptionInputValues;
    switch (state.agentType) {
      case AgentType.Artichoke:
        return (
          <section>
            <h3>Agent options</h3>
            <label>
              Hidden neurons:{" "}
              <input
                className={
                  isPositiveInteger(+inputValues.hiddenLayerSize)
                    ? ""
                    : "InvalidInput"
                }
                type="text"
                value={state.agentCreationOptionInputValues.hiddenLayerSize}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  this.changeAgentCreationOptionInputValue(
                    "hiddenLayerSize",
                    event.target.value
                  )
                }
              />
            </label>
          </section>
        );
    }
  }

  renderEvaluationMenu(state: EvaluationState): React.ReactElement {
    if (!state.hasStartedEvaluation) {
      return this.renderEvaluationAgentSelectionMenu(state);
    } else {
      if (state.firstAgentReward === undefined) {
        return this.renderEvaluationPendingMenu(state);
      } else {
        return this.renderEvaluationCompleteMenu(state);
      }
    }
  }

  renderEvaluationAgentSelectionMenu(
    state: EvaluationState
  ): React.ReactElement {
    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Back</button>
          <h2>Evaluate</h2>
        </section>
        <section>
          Evaluate <select></select> against <select></select>
          <button>Start</button>
        </section>
      </div>
    );
  }

  renderEvaluationPendingMenu(state: EvaluationState): React.ReactElement {
    return <div className="App"></div>;
  }

  renderEvaluationCompleteMenu(state: EvaluationState): React.ReactElement {
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

  onCreateAgentClick(): void {
    const state = this.expectState(StateType.AgentList);
    const newState: AgentCreationState = {
      stateType: StateType.AgentCreation,

      agents: state.agents,
      options: state.options,

      agentType: AgentType.Artichoke,
      agentCreationOptionInputValues: withPropertyValuesStringified(
        getDefaultAgentCreationOptions(AgentType.Artichoke)
      ),
      agentName: getUnusedAgentName(state.agents.map(({ name }) => name)),
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

  onAgentNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const state = this.expectState(StateType.AgentCreation);
    const newState: AgentCreationState = {
      ...state,
      agentName: event.target.value,
    };
    this.setState(newState);
  }

  onAgentTypeChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const state = this.expectState(StateType.AgentCreation);
    const agentType: AgentType = +event.target.value;

    if (!(agentType in AgentType)) {
      throw new Error("Unrecognized AgentType: " + agentType);
    }

    const newState: AgentCreationState = {
      ...state,
      agentType,
      agentCreationOptionInputValues: withPropertyValuesStringified(
        getDefaultAgentCreationOptions(agentType)
      ),
    };
    this.setState(newState);
  }

  changeAgentCreationOptionInputValue(
    optionName: keyof AgentCreationOptions,
    value: string
  ): void {
    const state = this.expectState(StateType.AgentCreation);
    const newState: AgentCreationState = {
      ...state,
      agentCreationOptionInputValues: {
        ...state.agentCreationOptionInputValues,
        [optionName]: value,
      },
    };
    this.setState(newState);
  }

  onConfirmCreationClick(): void {
    const state = this.expectState(StateType.AgentCreation);
    const newAgent = {
      name: state.agentName,
      agent: createAgent(
        state.agentType,
        withPropertyValuesParsedAsNumbers(state.agentCreationOptionInputValues)
      ),
    };
    agentsSaver.addAgent(newAgent);

    const newState: AgentListState = {
      stateType: StateType.AgentList,

      agents: state.agents.concat([newAgent]),
      options: state.options,
    };
    this.setState(newState);
  }
}

function getInitialState(): AppState {
  const agents = agentsSaver.getSavedAgents() ?? [];
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

function getUnusedAgentName(names: readonly string[]): string {
  const ideas = [
    "Ant",
    "Alligator",
    "Aardvark",
    "Bison",
    "Boar",
    "Boa",
    "Cougar",
    "Crane",
    "Crab",
    "Duck",
    "Dog",
    "Deer",
    "Egret",
    "Elephant",
    "Elk",
    "Flamingo",
    "Fox",
    "Frog",
  ];
  shuffle(ideas);

  for (const idea of ideas) {
    if (!names.includes(idea)) {
      return idea;
    }
  }

  let i = 2;
  while (true) {
    for (const idea of ideas) {
      const numbered = idea + i;
      if (!names.includes(numbered)) {
        return numbered;
      }
    }
    i++;
  }
}

function withPropertyValuesStringified<T>(obj: T): WithStringValues<T> {
  const out = {} as WithStringValues<T>;
  for (const key in obj) {
    out[key] = "" + obj[key];
  }
  return out;
}

function withPropertyValuesParsedAsNumbers<T>(obj: T): WithNumberValues<T> {
  const out = {} as WithNumberValues<T>;
  for (const key in obj) {
    out[key] = +obj[key];
  }
  return out;
}
