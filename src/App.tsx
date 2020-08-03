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
import { DaikonCreationOptions } from "./agents/daikon";
import { FigCreationOptions } from "./agents/fig";
import { GrapeCreationOptions } from "./agents/grape";
import { HabaneroCreationOptions } from "./agents/habanero";
import "./App.css";
import * as arraySet from "./arraySet";
import { Agent } from "./game/types";
import { getAgent } from "./getAgent";
import {
  isOnInclusiveUnitInterval,
  isPositiveFiniteNumber,
  isPositiveInteger,
} from "./numberValidation";
import { promisifiedEvaluate } from "./offloaders/evaluate";
import { trainAsync } from "./offloaders/train";
import { paintGraph } from "./paintGraph";
import { shuffle } from "./random";
import * as agentsSaver from "./stateSavers/agentsSaver";
import {
  getSavedAppOptions,
  saveAppOptions,
} from "./stateSavers/appOptionsSaver";
import {
  AgentCreationState,
  AgentDeletionState,
  AgentListState,
  AppOptionInputValues,
  AppOptions,
  AppState,
  APP_OPTIONS_VERSION,
  BetState,
  BetStateType,
  EvaluationState,
  Fold,
  FollowingBetState,
  GameAcknowledgeable,
  GameAcknowledgeableType,
  GraphState,
  InitialBetState,
  MaxBetState,
  NamedAgent,
  OptionsState,
  PlayState,
  PolicyGraphType,
  RelativeReward,
  Showdown,
  StateMap,
  StateType,
  TrainingAgentSelectionState,
  TrainingState,
  WithNumberValues,
  WithStringValues,
} from "./types/state";

const DISPLAYED_DECIMALS = 3;
const DEFAULT_BET = 0.5;

export default class App extends React.Component<{}, AppState> {
  private graphCanvasRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: {}) {
    super(props);

    (window as any).app = this;

    this.graphCanvasRef = React.createRef();

    this.state = getInitialState();

    this.bindMethods();
  }

  bindMethods(): void {
    this.onOptionsClick = this.onOptionsClick.bind(this);
    this.onCreateAgentClick = this.onCreateAgentClick.bind(this);
    this.onDeleteAgentClick = this.onDeleteAgentClick.bind(this);
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

    this.onFirstEvaluatedAgentNameChange = this.onFirstEvaluatedAgentNameChange.bind(
      this
    );
    this.onSecondEvaluatedAgentNameChange = this.onSecondEvaluatedAgentNameChange.bind(
      this
    );
    this.onStartEvaluationClick = this.onStartEvaluationClick.bind(this);

    this.onTraineeChange = this.onTraineeChange.bind(this);
    this.onStartTrainingClick = this.onStartTrainingClick.bind(this);

    this.onTerminateTrainingClick = this.onTerminateTrainingClick.bind(this);

    this.onCancelAgentDeletionClick = this.onCancelAgentDeletionClick.bind(
      this
    );
    this.onConfirmAgentDeletionClick = this.onConfirmAgentDeletionClick.bind(
      this
    );
    this.onNameOfAgentToBeDeletedChange = this.onNameOfAgentToBeDeletedChange.bind(
      this
    );
    this.onSelectAgentForDeletionClick = this.onSelectAgentForDeletionClick.bind(
      this
    );

    this.onOpponentNameChange = this.onOpponentNameChange.bind(this);
    this.onBetInputValueChange = this.onBetInputValueChange.bind(this);
    this.onPlaceBetClick = this.onPlaceBetClick.bind(this);
    this.onFoldClick = this.onFoldClick.bind(this);
    this.onAcknowledgeClick = this.onAcknowledgeClick.bind(this);

    this.onGraphedAgentNameChange = this.onGraphedAgentNameChange.bind(this);
    this.onGraphTypeChange = this.onGraphTypeChange.bind(this);
    this.onGraphNoiseChange = this.onGraphNoiseChange.bind(this);
  }

  componentDidUpdate() {
    const { state } = this;
    const canvas = this.graphCanvasRef.current;
    if (state.stateType === StateType.Graph && canvas !== null) {
      paintGraph(canvas, state);
    }
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
      case StateType.AgentDeletion:
        return this.renderAgentDeletionMenu(state);
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
    const agents = getSortedAgents(state);

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
          <button
            disabled={agents.length === 0}
            onClick={this.onDeleteAgentClick}
          >
            Delete agent
          </button>
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

  renderAgentParams(state: AgentCreationState): React.ReactElement | null {
    switch (state.agentType) {
      case AgentType.Artichoke: {
        const inputValues = state.agentCreationOptionInputValues as WithStringValues<
          ArtichokeCreationOptions
        >;
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
                value={inputValues.hiddenLayerSize}
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

      case AgentType.Broccoli:
        return null;

      case AgentType.Carrot:
        return null;

      case AgentType.Daikon: {
        const inputValues = state.agentCreationOptionInputValues as WithStringValues<
          DaikonCreationOptions
        >;
        return (
          <section>
            <h3>Agent options</h3>
            <label>
              Bet:{" "}
              <input
                className={
                  isOnInclusiveUnitInterval(+inputValues.bet)
                    ? ""
                    : "InvalidInput"
                }
                type="text"
                value={inputValues.bet}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  this.changeAgentCreationOptionInputValue(
                    "bet",
                    event.target.value
                  )
                }
              />
            </label>
          </section>
        );
      }

      case AgentType.Eggplant:
        return null;

      case AgentType.Fig: {
        const inputValues = state.agentCreationOptionInputValues as WithStringValues<
          FigCreationOptions
        >;
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
                value={inputValues.hiddenLayerSize}
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

      case AgentType.Grape: {
        const inputValues = state.agentCreationOptionInputValues as WithStringValues<
          GrapeCreationOptions
        >;
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
                value={inputValues.hiddenLayerSize}
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

      case AgentType.Habanero: {
        const inputValues = state.agentCreationOptionInputValues as WithStringValues<
          HabaneroCreationOptions
        >;
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
                value={inputValues.hiddenLayerSize}
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
  }

  renderAgentDeletionMenu(state: AgentDeletionState): React.ReactElement {
    const agents = getSortedAgents(state);

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Back</button>
          <h2>Delete agent</h2>
        </section>

        {state.isConfirmingDeletion ? (
          <section>
            <p>
              Are you sure you want to delete {state.selectedAgentName} (
              {getAgentTypeDisplayString(
                getAgent(state.agents, state.selectedAgentName).agentType
              )}
              )?
            </p>

            <p>
              The deletion will be permanent, and it will be impossible to
              restore this agent.
            </p>

            <section>
              <button onClick={this.onCancelAgentDeletionClick}>Cancel</button>
              <button
                className="DangerButton"
                onClick={this.onConfirmAgentDeletionClick}
              >
                Confirm
              </button>
            </section>
          </section>
        ) : (
          <section>
            <label>
              Choose an agent to delete:{" "}
              <select
                value={state.selectedAgentName}
                onChange={this.onNameOfAgentToBeDeletedChange}
              >
                {agents.map(({ name: agentName, agent }) => (
                  <option key={agentName} value={agentName}>
                    {agentName} ({getAgentTypeDisplayString(agent.agentType)})
                  </option>
                ))}
              </select>
              <button onClick={this.onSelectAgentForDeletionClick}>
                Select
              </button>
            </label>
          </section>
        )}
      </div>
    );
  }

  renderEvaluationMenu(state: EvaluationState): React.ReactElement {
    if (!state.hasStartedEvaluation) {
      return this.renderEvaluationAgentSelectionMenu(state);
    } else {
      const { firstAgentReward } = state;
      if (firstAgentReward === undefined) {
        return this.renderEvaluationInProgressMenu(state);
      } else {
        return this.renderEvaluationCompleteMenu(state, firstAgentReward);
      }
    }
  }

  renderEvaluationAgentSelectionMenu(
    state: EvaluationState
  ): React.ReactElement {
    const { selectedAgentNames } = state;
    const agents = getSortedAgents(state);

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Back</button>
          <h2>Evaluate</h2>
        </section>

        <section>
          Evaluate{" "}
          <select
            value={selectedAgentNames[0]}
            onChange={this.onFirstEvaluatedAgentNameChange}
          >
            {agents.map(({ name: agentName, agent }) => (
              <option value={agentName} key={agentName}>
                {agentName} ({getAgentTypeDisplayString(agent.agentType)})
              </option>
            ))}
          </select>{" "}
          against{" "}
          <select
            value={selectedAgentNames[1]}
            onChange={this.onSecondEvaluatedAgentNameChange}
          >
            {agents.map(({ name: agentName, agent }) => (
              <option value={agentName} key={agentName}>
                {agentName} ({getAgentTypeDisplayString(agent.agentType)})
              </option>
            ))}
          </select>
          <button onClick={this.onStartEvaluationClick}>Start</button>
        </section>
      </div>
    );
  }

  renderEvaluationInProgressMenu(state: EvaluationState): React.ReactElement {
    const { selectedAgentNames } = state;

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Cancel</button>
          <h2>Evaluate</h2>
        </section>

        <section>
          Evaluating {selectedAgentNames[0]} (
          {getAgentTypeDisplayString(
            getAgent(state.agents, selectedAgentNames[0]).agentType
          )}
          ) against {selectedAgentNames[1]} (
          {getAgentTypeDisplayString(
            getAgent(state.agents, selectedAgentNames[1]).agentType
          )}
          ...
        </section>
      </div>
    );
  }

  renderEvaluationCompleteMenu(
    state: EvaluationState,
    firstAgentReward: number
  ): React.ReactElement {
    const { selectedAgentNames } = state;
    const { hands } = state.options.trainingCycleOptions.evaluationOptions;

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Done</button>
          <h2>Evaluate</h2>
        </section>

        <section>
          Evaluated {selectedAgentNames[0]} (
          {getAgentTypeDisplayString(
            getAgent(state.agents, selectedAgentNames[0]).agentType
          )}
          ) against {selectedAgentNames[1]} (
          {getAgentTypeDisplayString(
            getAgent(state.agents, selectedAgentNames[1]).agentType
          )}
          ): {firstAgentReward > 0 ? "+" : ""}
          {firstAgentReward.toFixed(DISPLAYED_DECIMALS)} (
          {((100 * (firstAgentReward + hands)) / (2 * hands)).toFixed(2)}%)
        </section>
      </div>
    );
  }

  renderTrainingAgentSelectionMenu(
    state: TrainingAgentSelectionState
  ): React.ReactElement {
    const agents = getSortedAgents(state);

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Back</button>
          <h2>Train</h2>
        </section>

        <section>
          Train{" "}
          <select
            value={state.selectedAgentName}
            onChange={this.onTraineeChange}
          >
            {agents.map(({ name: agentName, agent }) => (
              <option value={agentName} key={agentName}>
                {agentName} ({getAgentTypeDisplayString(agent.agentType)})
              </option>
            ))}
          </select>{" "}
          against:{" "}
          <section>
            {agents.map(({ name: agentName, agent }) => (
              <label key={agentName}>
                <input
                  type="checkbox"
                  checked={state.opponentNames.includes(agentName)}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    this.setIsAgentUsedAsOpponent(
                      agentName,
                      event.target.checked
                    )
                  }
                />{" "}
                {agentName} ({getAgentTypeDisplayString(agent.agentType)})
              </label>
            ))}
          </section>
          <button
            disabled={state.opponentNames.length < 1}
            onClick={this.onStartTrainingClick}
          >
            Start
          </button>
        </section>
      </div>
    );
  }

  renderTrainingMenu(state: TrainingState): React.ReactElement {
    if (state.cyclesCompleted === state.options.trainingCycles) {
      return this.renderTrainingCompleteMenu(state);
    } else if (state.hasTrainingBeenTerminated) {
      return this.renderTrainingTerminatedMenu(state);
    } else {
      return this.renderTrainingInProgressMenu(state);
    }
  }

  renderTrainingCompleteMenu(state: TrainingState): React.ReactElement {
    const agents = getSortedAgents(state);
    const { hands } = state.options.trainingCycleOptions.evaluationOptions;
    const opponents = state.opponentNames.map((opponentName) => ({
      name: opponentName,
      agent: getAgent(agents, opponentName),
    }));

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Done</button>{" "}
          <h2>Training</h2>
        </section>

        <section>
          Finished training {state.traineeName} (
          {getAgentTypeDisplayString(
            getAgent(agents, state.traineeName).agentType
          )}
          ) against:{" "}
          <section>
            <ol className="Unnumbered">
              {state.relativeRewardLists.map((relativeRewardList, i) => {
                return (
                  <li key={i}>
                    Cycle {i}:
                    <ul>
                      {opponents.map(({ name: agentName, agent }) => {
                        const relativeReward = getRelativeReward(
                          relativeRewardList,
                          agentName
                        );
                        const performance =
                          (relativeReward + hands) / (2 * hands);
                        return (
                          <li key={agentName}>
                            <label>
                              {agentName} (
                              {getAgentTypeDisplayString(agent.agentType)}
                              ): {relativeReward.toFixed(DISPLAYED_DECIMALS)} (
                              {(performance * 100).toFixed(2)}%)
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </section>
        </section>
      </div>
    );
  }

  renderTrainingTerminatedMenu(state: TrainingState): React.ReactElement {
    const agents = getSortedAgents(state);
    const { hands } = state.options.trainingCycleOptions.evaluationOptions;
    const opponents = state.opponentNames.map((opponentName) => ({
      name: opponentName,
      agent: getAgent(agents, opponentName),
    }));

    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Done</button>{" "}
          <h2>Training</h2>
        </section>

        <section>
          Terminated training {state.traineeName} (
          {getAgentTypeDisplayString(
            getAgent(agents, state.traineeName).agentType
          )}
          ) against:{" "}
          <section>
            <ol className="Unnumbered">
              {state.relativeRewardLists.map((relativeRewardList, i) => {
                return (
                  <li key={i}>
                    Cycle {i}:
                    <ul>
                      {opponents.map(({ name: agentName, agent }) => {
                        const relativeReward = getRelativeReward(
                          relativeRewardList,
                          agentName
                        );
                        const performance =
                          (relativeReward + hands) / (2 * hands);
                        return (
                          <li key={agentName}>
                            <label>
                              {agentName} (
                              {getAgentTypeDisplayString(agent.agentType)}
                              ): {relativeReward.toFixed(DISPLAYED_DECIMALS)} (
                              {(performance * 100).toFixed(2)}%)
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </section>
        </section>
      </div>
    );
  }

  renderTrainingInProgressMenu(state: TrainingState): React.ReactElement {
    const agents = getSortedAgents(state);
    const { hands } = state.options.trainingCycleOptions.evaluationOptions;
    const opponents = state.opponentNames.map((opponentName) => ({
      name: opponentName,
      agent: getAgent(agents, opponentName),
    }));

    return (
      <div className="App">
        <section>
          <button onClick={this.onTerminateTrainingClick}>Terminate</button>{" "}
          <h2>Training</h2>
        </section>

        <section>
          Training {state.traineeName} (
          {getAgentTypeDisplayString(
            getAgent(agents, state.traineeName).agentType
          )}
          ) against:{" "}
          <section>
            <ol className="Unnumbered">
              {state.relativeRewardLists.map((relativeRewardList, i) => {
                return (
                  <li key={i}>
                    Cycle {i}:
                    <ul>
                      {opponents.map(({ name: agentName, agent }) => {
                        const relativeReward = getRelativeReward(
                          relativeRewardList,
                          agentName
                        );
                        const performance =
                          (relativeReward + hands) / (2 * hands);
                        return (
                          <li key={agentName}>
                            <label>
                              {agentName} (
                              {getAgentTypeDisplayString(agent.agentType)}
                              ): {relativeReward.toFixed(DISPLAYED_DECIMALS)} (
                              {(performance * 100).toFixed(2)}%)
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </section>
        </section>
      </div>
    );
  }

  renderPlayMenu(state: PlayState): React.ReactElement {
    const { betState, acknowledgeable } = state;
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;

    let betStateOrAcknowledgementMenu: React.ReactElement;
    if (acknowledgeable !== undefined) {
      betStateOrAcknowledgementMenu = this.renderAcknowledgementMenu(
        acknowledgeable
      );
    } else {
      switch (betState.betStateType) {
        case BetStateType.Initial:
          betStateOrAcknowledgementMenu = this.renderInitialBetMenu(
            betState,
            ante
          );
          break;
        case BetStateType.Following:
          betStateOrAcknowledgementMenu = this.renderFollowingBetMenu(betState);
          break;
        case BetStateType.Max:
          betStateOrAcknowledgementMenu = this.renderMaxBetMenu(betState);
          break;
      }
    }

    const agents = getSortedAgents(state);
    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Quit</button>
          <h2>Play</h2>
        </section>

        <section>
          <label className="PlayMenuLabel">
            Playing{" "}
            <select
              value={state.opponentName}
              onChange={this.onOpponentNameChange}
            >
              {agents.map(({ name: agentName, agent }) => (
                <option key={agentName} value={agentName}>
                  {agentName} ({getAgentTypeDisplayString(agent.agentType)})
                </option>
              ))}
            </select>
          </label>

          <label className="PlayMenuLabel">Hands played: {state.hands}</label>

          <label className="PlayMenuLabel">
            Reward: {state.reward.toFixed(DISPLAYED_DECIMALS)}
          </label>

          {state.hands === 0 ? (
            <label className="PlayMenuLabel">Performance: 50.00%</label>
          ) : (
            <label className="PlayMenuLabel">
              Performance:{" "}
              {(
                (100 * (state.reward + state.hands)) /
                (2 * state.hands)
              ).toFixed(2)}
              %
            </label>
          )}
        </section>

        {betStateOrAcknowledgementMenu}
      </div>
    );
  }

  renderAcknowledgementMenu(
    acknowledgeable: GameAcknowledgeable
  ): React.ReactElement {
    switch (acknowledgeable.acknowledgeableType) {
      case GameAcknowledgeableType.Showdown:
        return this.renderShowdownAcknowledgementMenu(acknowledgeable);
      case GameAcknowledgeableType.Fold:
        return this.renderFoldAcknowledgementMenu(acknowledgeable);
    }
  }

  renderShowdownAcknowledgementMenu(
    acknowledgeable: Showdown
  ): React.ReactElement {
    const {
      strength: userStrength,
      opponentStrength,
      reward,
    } = acknowledgeable;
    if (reward > 0) {
      return (
        <section>
          <p>You won {reward}.</p>
          <p>Your strength: {userStrength}</p>
          <p>Opponent strength: {opponentStrength}</p>
          <button onClick={this.onAcknowledgeClick}>Continue</button>
        </section>
      );
    } else if (reward < 0) {
      return (
        <section>
          <p>You lost {-reward}.</p>
          <p>Your strength: {userStrength}</p>
          <p>Opponent strength: {opponentStrength}</p>
          <button onClick={this.onAcknowledgeClick}>Continue</button>
        </section>
      );
    } else {
      return (
        <section>
          You and your opponent both had a strength of {userStrength}, so
          nothing was won or lost.
          <button onClick={this.onAcknowledgeClick}>Continue</button>
        </section>
      );
    }
  }

  renderFoldAcknowledgementMenu(acknowledgeable: Fold): React.ReactElement {
    const { reward } = acknowledgeable;
    if (reward > 0) {
      return (
        <section>
          <p>You won {reward} because your opponent folded.</p>
          <button onClick={this.onAcknowledgeClick}>Continue</button>
        </section>
      );
    } else {
      return (
        <section>
          <p>You lost {-reward} by folding.</p>
          <button onClick={this.onAcknowledgeClick}>Continue</button>
        </section>
      );
    }
  }

  renderInitialBetMenu(
    betState: InitialBetState,
    ante: number
  ): React.ReactElement {
    return (
      <section>
        <h3>You are betting first.</h3>
        <label className="BetMenuLabel">Strength: {betState.strength}</label>
        <label className="BetMenuLabel">
          Your initial bet:{" "}
          <input
            className={
              isOnInclusiveUnitInterval(+betState.betInputValue) &&
              +betState.betInputValue >= ante
                ? ""
                : "InvalidInput"
            }
            type="text"
            value={betState.betInputValue}
            onChange={this.onBetInputValueChange}
          />
          <input
            className={
              isOnInclusiveUnitInterval(+betState.betInputValue) &&
              +betState.betInputValue >= ante
                ? ""
                : "InvalidInput"
            }
            type="range"
            min={ante}
            max={1}
            step={0.001}
            value={+betState.betInputValue}
            onChange={this.onBetInputValueChange}
          />
        </label>
        <button
          disabled={
            !(
              isOnInclusiveUnitInterval(+betState.betInputValue) &&
              +betState.betInputValue >= ante
            )
          }
          onClick={this.onPlaceBetClick}
        >
          Place bet
        </button>
      </section>
    );
  }

  renderFollowingBetMenu(betState: FollowingBetState): React.ReactElement {
    const initialBet = betState.opponentInitialBet;
    return (
      <section>
        <h3>You are betting second.</h3>
        <label className="BetMenuLabel">Strength: {betState.strength}</label>
        <label className="BetMenuLabel">Opponent's bet: {initialBet}</label>
        <label className="BetMenuLabel">
          Your bet:{" "}
          <input
            className={
              isOnInclusiveUnitInterval(+betState.betInputValue) &&
              +betState.betInputValue >= initialBet
                ? ""
                : "InvalidInput"
            }
            type="text"
            value={betState.betInputValue}
            onChange={this.onBetInputValueChange}
          />
          <input
            className={
              isOnInclusiveUnitInterval(+betState.betInputValue) &&
              +betState.betInputValue >= initialBet
                ? ""
                : "InvalidInput"
            }
            type="range"
            min={initialBet}
            max={1}
            step={0.001}
            value={+betState.betInputValue}
            onChange={this.onBetInputValueChange}
          />
        </label>

        <button
          disabled={
            !(
              isOnInclusiveUnitInterval(+betState.betInputValue) &&
              +betState.betInputValue >= initialBet
            )
          }
          onClick={this.onPlaceBetClick}
        >
          Place bet
        </button>
        <button onClick={this.onFoldClick}>Fold</button>
      </section>
    );
  }

  renderMaxBetMenu(betState: MaxBetState): React.ReactElement {
    return (
      <section>
        <h3>Your opponent raised.</h3>
        <label className="BetMenuLabel">Strength: {betState.strength}</label>
        <label className="BetMenuLabel">
          Your initial bet: {betState.initialBet}
        </label>
        <label className="BetMenuLabel">
          Opponent's bet: {betState.followingBet}
        </label>

        <button onClick={this.onPlaceBetClick}>Call</button>
        <button onClick={this.onFoldClick}>Fold</button>
      </section>
    );
  }

  renderGraphMenu(state: GraphState): React.ReactElement {
    const agents = getSortedAgents(state);
    return (
      <div className="App">
        <section>
          <button onClick={this.onAgentListClick}>Back</button>
          <h2>Graph</h2>
        </section>

        <label>
          Agent:{" "}
          <select
            value={state.graphedAgentName}
            onChange={this.onGraphedAgentNameChange}
          >
            {agents.map(({ name: agentName, agent }) => (
              <option key={agentName} value={agentName}>
                {agentName} ({getAgentTypeDisplayString(agent.agentType)})
              </option>
            ))}
          </select>
        </label>

        <label>
          Component:{" "}
          <select
            value={state.graph.policyGraphType}
            onChange={this.onGraphTypeChange}
          >
            <option value={PolicyGraphType.Leader}>Leader</option>
            <option value={PolicyGraphType.Follower}>Follower</option>
          </select>
        </label>

        <label>
          Noise:{" "}
          <input
            className={
              +state.noiseInputValue === 1
                ? "DiscouragedInput"
                : isOnInclusiveUnitInterval(+state.noiseInputValue)
                ? ""
                : "InvalidInput"
            }
            type="text"
            value={state.noiseInputValue}
            onChange={this.onGraphNoiseChange}
          />
          <input
            className={
              isOnInclusiveUnitInterval(+state.noiseInputValue)
                ? ""
                : "InvalidInput"
            }
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={state.graph.noise}
            onChange={this.onGraphNoiseChange}
          />
        </label>

        <table>
          <tbody>
            <tr>
              <td>Bet</td>
              <td>
                <canvas className="PolicyGraph" ref={this.graphCanvasRef} />
              </td>
            </tr>
            <tr>
              <td />
              <td>Strength</td>
            </tr>
          </tbody>
        </table>

        <section>
          <h3>Key</h3>
          {state.graph.policyGraphType === PolicyGraphType.Leader ? (
            <>
              <p className="Key__InitialBet">Red = initial bet</p>
              <p className="Key__UnclampedMaxBet">Green = unclamped max bet</p>
              <p className="Key__ClampedMaxBet">
                Blue = clamped max bet = max(initial bet, unclamped max bet)
              </p>
            </>
          ) : (
            <>
              <p>Lighter = lower bet (white = 0)</p>
              <p>Darker = higher bet (black = 1)</p>
            </>
          )}
        </section>
      </div>
    );
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

  onDeleteAgentClick(): void {
    const state = this.expectState(StateType.AgentList);
    const newState: AgentDeletionState = {
      stateType: StateType.AgentDeletion,

      agents: state.agents,
      options: state.options,

      selectedAgentName: state.agents[0].name,
      isConfirmingDeletion: false,
    };
    this.setState(newState);
  }

  onEvaluateClick(): void {
    const state = this.expectState(StateType.AgentList);
    const newState: EvaluationState = {
      stateType: StateType.Evaluation,

      agents: state.agents,
      options: state.options,

      selectedAgentNames:
        state.agents.length >= 2
          ? [state.agents[0].name, state.agents[1].name]
          : [state.agents[0].name, state.agents[0].name],
      hasStartedEvaluation: false,
      firstAgentReward: undefined,
    };
    this.setState(newState);
  }

  onTrainClick(): void {
    const { state } = this;
    const newState: TrainingAgentSelectionState = {
      stateType: StateType.TrainingAgentSelection,

      agents: state.agents,
      options: state.options,

      selectedAgentName: state.agents[0].name,
      opponentNames: [],
    };
    this.setState(newState);
  }

  onPlayClick(): void {
    const { state } = this;
    const namedOpponent = state.agents[0];
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;

    const newState: PlayState = {
      stateType: StateType.Play,

      agents: state.agents,
      options: state.options,

      opponentName: namedOpponent.name,
      reward: 0,
      hands: 0,

      betState: getRandomBetState(namedOpponent.agent, ante),
      acknowledgeable: undefined,
    };
    this.setState(newState);
  }

  onGraphClick(): void {
    const { state } = this;

    const noise = Math.random();
    const newState: GraphState = {
      stateType: StateType.Graph,

      agents: state.agents,
      options: state.options,

      graphedAgentName: state.agents[0].name,
      noiseInputValue: "" + noise,
      graph: {
        policyGraphType: PolicyGraphType.Leader,

        noise,
        inspectedPoint: undefined,
      },
    };
    this.setState(newState);
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

  changeAgentCreationOptionInputValue<T extends AgentCreationOptions>(
    optionName: keyof T,
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

  onFirstEvaluatedAgentNameChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    const state = this.expectState(StateType.Evaluation);
    const newState: EvaluationState = {
      ...state,
      selectedAgentNames: [event.target.value, state.selectedAgentNames[1]],
    };
    this.setState(newState);
  }

  onSecondEvaluatedAgentNameChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    const state = this.expectState(StateType.Evaluation);
    const newState: EvaluationState = {
      ...state,
      selectedAgentNames: [state.selectedAgentNames[0], event.target.value],
    };
    this.setState(newState);
  }

  onStartEvaluationClick(): void {
    const state = this.expectState(StateType.Evaluation);

    if (state.hasStartedEvaluation) {
      return;
    }

    {
      const newState: EvaluationState = {
        ...state,
        hasStartedEvaluation: true,
      };
      this.setState(newState);
    }

    const firstAgent = getAgent(state.agents, state.selectedAgentNames[0]);
    const secondAgent = getAgent(state.agents, state.selectedAgentNames[1]);
    promisifiedEvaluate(
      firstAgent,
      secondAgent,
      state.options.trainingCycleOptions.evaluationOptions,
      state.options.useMainThreadForExpensiveComputation
    ).then((firstAgentReward) => {
      const currentState = this.state;
      if (
        currentState.stateType === StateType.Evaluation &&
        currentState.selectedAgentNames[0] === state.selectedAgentNames[0] &&
        currentState.selectedAgentNames[1] === state.selectedAgentNames[1]
      ) {
        const newState: EvaluationState = { ...currentState, firstAgentReward };
        this.setState(newState);
      }
    });
  }

  onTraineeChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const state = this.expectState(StateType.TrainingAgentSelection);
    const newState: TrainingAgentSelectionState = {
      ...state,
      selectedAgentName: event.target.value,
    };
    this.setState(newState);
  }

  setIsAgentUsedAsOpponent(agentName: string, isUsed: boolean): void {
    const state = this.expectState(StateType.TrainingAgentSelection);
    const newState: TrainingAgentSelectionState = {
      ...state,
      opponentNames: isUsed
        ? arraySet.add(state.opponentNames, agentName)
        : arraySet.remove(state.opponentNames, agentName),
    };
    this.setState(newState);
  }

  onStartTrainingClick(): void {
    const state = this.expectState(StateType.TrainingAgentSelection);
    {
      const newState: TrainingState = {
        stateType: StateType.Training,

        agents: state.agents,
        options: state.options,

        cyclesCompleted: 0,
        traineeName: state.selectedAgentName,
        opponentNames: state.opponentNames,
        relativeRewardLists: [],
        hasTrainingBeenTerminated: false,

        terminateTraining: noOp,
      };
      this.setState(newState, () => this.startTraining(state));
    }
  }

  startTraining(preTrainingState: TrainingAgentSelectionState): void {
    const trainee = getNamedAgent(
      preTrainingState.agents,
      preTrainingState.selectedAgentName
    );
    const opponents = preTrainingState.opponentNames.map((opponentName) =>
      getNamedAgent(preTrainingState.agents, opponentName)
    );
    const { options } = preTrainingState;
    trainAsync(
      trainee,
      opponents,
      options.trainingCycles,
      options.trainingCycleOptions,
      options.useMainThreadForExpensiveComputation,
      (
        cycleNumber: number,
        updatedTrainee: NamedAgent,
        relativeRewards: RelativeReward[],
        terminateTraining: () => void
      ): void => {
        const currentState = this.state;

        if (
          !(
            currentState.stateType === StateType.Training &&
            currentState.traineeName === trainee.name &&
            arraySet.isEqual(
              currentState.opponentNames,
              preTrainingState.opponentNames
            )
          )
        ) {
          terminateTraining();
          return;
        }

        this.setState((prevState) => {
          if (
            !(
              prevState.stateType === StateType.Training &&
              prevState.traineeName === trainee.name &&
              arraySet.isEqual(
                prevState.opponentNames,
                preTrainingState.opponentNames
              )
            )
          ) {
            terminateTraining();
            return prevState;
          }

          let newAgent: NamedAgent;
          if (cycleNumber >= prevState.cyclesCompleted) {
            newAgent = updatedTrainee;
            agentsSaver.updateAgent(newAgent);
          } else {
            newAgent = prevState.agents.find(
              (agent) => agent.name === trainee.name
            )!;
          }

          const newState: TrainingState = {
            ...prevState,
            agents: prevState.agents.map((prevAgent) =>
              prevAgent.name === updatedTrainee.name ? newAgent : prevAgent
            ),
            cyclesCompleted: cycleNumber + 1,
            relativeRewardLists: immutSetElement(
              prevState.relativeRewardLists,
              cycleNumber,
              relativeRewards
            ),
            terminateTraining,
          };
          return newState;
        });
      }
    );
  }

  onTerminateTrainingClick(): void {
    const state = this.expectState(StateType.Training);

    state.terminateTraining();

    const newState: TrainingState = {
      ...state,
      hasTrainingBeenTerminated: true,
      terminateTraining: noOp,
    };
    this.setState(newState);
  }

  onCancelAgentDeletionClick(): void {
    const state = this.expectState(StateType.AgentDeletion);
    const newState: AgentDeletionState = {
      ...state,
      isConfirmingDeletion: false,
    };
    this.setState(newState);
  }

  onConfirmAgentDeletionClick(): void {
    const state = this.expectState(StateType.AgentDeletion);

    agentsSaver.removeAgent(state.selectedAgentName);

    const newState: AgentListState = {
      stateType: StateType.AgentList,

      agents: state.agents.filter(
        ({ name }) => name !== state.selectedAgentName
      ),
      options: state.options,
    };
    this.setState(newState);
  }

  onNameOfAgentToBeDeletedChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    const state = this.expectState(StateType.AgentDeletion);
    const newState: AgentDeletionState = {
      ...state,
      selectedAgentName: event.target.value,
    };
    this.setState(newState);
  }

  onSelectAgentForDeletionClick(): void {
    const state = this.expectState(StateType.AgentDeletion);
    const newState: AgentDeletionState = {
      ...state,
      isConfirmingDeletion: true,
    };
    this.setState(newState);
  }

  onOpponentNameChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const state = this.expectState(StateType.Play);
    const newOpponentName = event.target.value;

    if (state.opponentName === newOpponentName) {
      return;
    }

    const opponent = getAgent(state.agents, newOpponentName);
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;

    const newState: PlayState = {
      stateType: StateType.Play,

      agents: state.agents,
      options: state.options,

      opponentName: newOpponentName,
      reward: 0,
      hands: 0,
      betState: getRandomBetState(opponent, ante),
      acknowledgeable: undefined,
    };
    this.setState(newState);
  }

  onBetInputValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const state = this.expectState(StateType.Play);

    if (state.betState.betStateType === BetStateType.Max) {
      throw new Error(
        "Impossible: state.betState.betInputValue does not exist on MaxBetState, and therefore cannot be changed."
      );
    }

    const newState: PlayState = {
      ...state,
      betState: { ...state.betState, betInputValue: event.target.value },
    };
    this.setState(newState);
  }

  onPlaceBetClick(): void {
    const state = this.expectState(StateType.Play);
    const { betState } = state;

    switch (betState.betStateType) {
      case BetStateType.Initial:
        this.placeInitialBet(state, betState);
        break;

      case BetStateType.Following:
        this.placeFollowingBet(state, betState);
        break;

      case BetStateType.Max:
        this.callFollowingBet(state, betState);
        break;
    }
  }

  placeInitialBet(state: PlayState, betState: InitialBetState): void {
    const opponent = getAgent(state.agents, state.opponentName);
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;

    const initialBet = +betState.betInputValue;
    const { opponentStrength } = betState;
    const followingBet = Math.max(
      ante,
      opponent.follow(opponentStrength, initialBet, Math.random())
    );
    if (followingBet > initialBet) {
      const maxBetState: MaxBetState = {
        betStateType: BetStateType.Max,

        strength: betState.strength,
        opponentStrength,
        initialBet,
        followingBet,
      };
      const newState: PlayState = {
        ...state,
        betState: maxBetState,
      };
      this.setState(newState);
    } else if (followingBet < initialBet) {
      const newState: PlayState = {
        ...state,
        betState: getRandomBetState(opponent, ante),
        reward: state.reward + ante,
        hands: state.hands + 1,
        acknowledgeable: {
          acknowledgeableType: GameAcknowledgeableType.Fold,
          reward: ante,
        },
      };
      this.setState(newState);
    } else {
      this.showdown(state, betState, initialBet);
    }
  }

  showdown(state: PlayState, betState: BetState, usedBet: number): void {
    const opponent = getAgent(state.agents, state.opponentName);
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;
    const { strength: userStrength, opponentStrength } = betState;

    if (userStrength > opponentStrength) {
      const newState: PlayState = {
        ...state,
        betState: getRandomBetState(opponent, ante),
        reward: state.reward + usedBet,
        hands: state.hands + 1,
        acknowledgeable: {
          acknowledgeableType: GameAcknowledgeableType.Showdown,
          strength: userStrength,
          opponentStrength,
          reward: usedBet,
        },
      };
      this.setState(newState);
    } else if (userStrength < opponentStrength) {
      const newState: PlayState = {
        ...state,
        betState: getRandomBetState(opponent, ante),
        reward: state.reward - usedBet,
        hands: state.hands + 1,
        acknowledgeable: {
          acknowledgeableType: GameAcknowledgeableType.Showdown,
          strength: userStrength,
          opponentStrength,
          reward: -usedBet,
        },
      };
      this.setState(newState);
    } else {
      const newState: PlayState = {
        ...state,
        betState: getRandomBetState(opponent, ante),
        reward: state.reward,
        hands: state.hands + 1,
        acknowledgeable: {
          acknowledgeableType: GameAcknowledgeableType.Showdown,
          strength: userStrength,
          opponentStrength,
          reward: 0,
        },
      };
      this.setState(newState);
    }
  }

  placeFollowingBet(state: PlayState, betState: FollowingBetState): void {
    const followingBet = +betState.betInputValue;

    if (followingBet < betState.opponentInitialBet) {
      const { ante } = state.options.trainingCycleOptions.evaluationOptions;
      this.fold(state, ante);
      return;
    }

    const { opponentMaxBet } = betState;
    const opponent = getAgent(state.agents, state.opponentName);
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;
    if (followingBet > opponentMaxBet) {
      const newState: PlayState = {
        ...state,
        betState: getRandomBetState(opponent, ante),
        hands: state.hands + 1,
        reward: state.reward + ante,
        acknowledgeable: {
          acknowledgeableType: GameAcknowledgeableType.Fold,
          reward: ante,
        },
      };
      this.setState(newState);
    } else {
      this.showdown(state, betState, followingBet);
    }
  }

  callFollowingBet(state: PlayState, betState: MaxBetState): void {
    this.showdown(state, betState, betState.followingBet);
  }

  onFoldClick(): void {
    const state = this.expectState(StateType.Play);
    const { betState } = state;
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;
    switch (betState.betStateType) {
      case BetStateType.Initial:
        throw new Error("Impossible: Cannot fold during InitialBetState");
      case BetStateType.Following:
        this.fold(state, ante);
        break;
      case BetStateType.Max:
        this.fold(state, betState.initialBet);
        break;
    }
  }

  fold(state: PlayState, forfeitedBet: number): void {
    const opponent = getAgent(state.agents, state.opponentName);
    const { ante } = state.options.trainingCycleOptions.evaluationOptions;

    const newState: PlayState = {
      ...state,

      hands: state.hands + 1,
      reward: state.reward - forfeitedBet,
      betState: getRandomBetState(opponent, ante),
      acknowledgeable: {
        acknowledgeableType: GameAcknowledgeableType.Fold,
        reward: -forfeitedBet,
      },
    };
    this.setState(newState);
  }

  onAcknowledgeClick(): void {
    const state = this.expectState(StateType.Play);
    const newState: PlayState = { ...state, acknowledgeable: undefined };
    this.setState(newState);
  }

  onGraphedAgentNameChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const state = this.expectState(StateType.Graph);
    const newState: GraphState = {
      ...state,
      graphedAgentName: event.target.value,
      graph: { ...state.graph, inspectedPoint: undefined },
    };
    this.setState(newState);
  }

  onGraphTypeChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const state = this.expectState(StateType.Graph);
    const policyGraphType: PolicyGraphType = +event.target.value;
    const newState: GraphState = {
      ...state,
      graph: {
        policyGraphType,

        noise: state.graph.noise,
        inspectedPoint: undefined,
      },
    };
    this.setState(newState);
  }

  onGraphNoiseChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const noiseInputValue = event.target.value;
    const isNoiseValid = isOnInclusiveUnitInterval(+noiseInputValue);

    const state = this.expectState(StateType.Graph);
    const newState: GraphState = {
      ...state,
      noiseInputValue,
      graph: {
        ...state.graph,
        noise: isNoiseValid ? +noiseInputValue : state.graph.noise,
      },
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

function getSortedAgents(state: AppState): NamedAgent[] {
  return state.agents
    .slice()
    .sort((a, b) => compareLexicographically(a.name, b.name));
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

function getNamedAgent(agents: NamedAgent[], expectedName: string): NamedAgent {
  const agent = getAgent(agents, expectedName);
  return { name: expectedName, agent };
}

function getRelativeReward(
  rewards: RelativeReward[],
  expectedName: string
): number {
  for (const { opponentName, reward } of rewards) {
    if (opponentName === expectedName) {
      return reward;
    }
  }

  throw new Error(
    "Cannot find reward against agent named " +
      JSON.stringify(expectedName) +
      ". The only relative rewards provided were: " +
      JSON.stringify(rewards)
  );
}

function immutSetElement<T>(src: readonly T[], index: number, item: T): T[] {
  const clone = src.slice();
  clone[index] = item;
  return clone;
}

function getRandomBetState(opponent: Agent, ante: number): BetState {
  if (Math.random() > 0.5) {
    return getRandomInitialBetState(ante);
  } else {
    return getRandomFollowingBetState(opponent, ante);
  }
}

function getRandomInitialBetState(ante: number): InitialBetState {
  return {
    betStateType: BetStateType.Initial,
    strength: Math.random(),
    opponentStrength: Math.random(),
    betInputValue: Math.max(ante, DEFAULT_BET).toFixed(DISPLAYED_DECIMALS),
  };
}

function getRandomFollowingBetState(
  opponent: Agent,
  ante: number
): FollowingBetState {
  const opponentStrength = Math.random();
  const opponentBets = opponent.lead(opponentStrength, Math.random());
  const opponentInitialBet = Math.max(ante, opponentBets[0]);
  const opponentMaxBet = Math.max(opponentInitialBet, opponentBets[1]);
  return {
    betStateType: BetStateType.Following,
    strength: Math.random(),
    opponentStrength,
    opponentInitialBet,
    opponentMaxBet,
    betInputValue: Math.max(opponentInitialBet, DEFAULT_BET).toFixed(
      DISPLAYED_DECIMALS
    ),
  };
}

function noOp(): void {}
