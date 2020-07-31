import { AgentCreationOptions, AgentType } from "../agents";
import { Agent, TrainingCycleOptions } from "../game/types";

export type AppState =
  | AgentListState
  | OptionsState
  | AgentCreationState
  | AgentDeletionState
  | EvaluationState
  | TrainingAgentSelectionState
  | TrainingState
  | PlayState
  | GraphState;

export enum StateType {
  AgentList,
  Options,
  AgentCreation,
  AgentDeletion,
  Evaluation,
  TrainingAgentSelection,
  Training,
  Play,
  Graph,
}

export interface StateMap {
  [StateType.AgentList]: AgentListState;
  [StateType.Options]: OptionsState;
  [StateType.AgentCreation]: AgentCreationState;
  [StateType.AgentDeletion]: AgentDeletionState;
  [StateType.Evaluation]: EvaluationState;
  [StateType.TrainingAgentSelection]: TrainingAgentSelectionState;
  [StateType.Training]: TrainingState;
  [StateType.Play]: PlayState;
  [StateType.Graph]: GraphState;
}

export interface AgentListState {
  stateType: StateType.AgentList;

  agents: NamedAgent[];
  options: AppOptions;
}

export interface NamedAgent {
  name: string;
  agent: Agent;
}

export const APP_OPTIONS_VERSION = 1;

export interface AppOptions {
  version: typeof APP_OPTIONS_VERSION;
  trainingCycles: number;
  trainingCycleOptions: TrainingCycleOptions;
  useMainThreadForExpensiveComputation: boolean;
}

export interface OptionsState {
  stateType: StateType.Options;

  agents: NamedAgent[];
  options: AppOptions;

  inputValues: AppOptionInputValues;
}

export interface AppOptionInputValues {
  trainingCycles: string;
  trainingCycleOptions: {
    derivativeStep: string;
    learningRate: string;
    evaluationOptions: {
      hands: string;
      ante: string;
    };
  };
}

export interface AgentCreationState {
  stateType: StateType.AgentCreation;

  agents: NamedAgent[];
  options: AppOptions;

  agentType: AgentType;
  agentCreationOptionInputValues: WithStringValues<AgentCreationOptions>;
  agentName: string;
}

export type WithStringValues<T> = { [key in keyof T]: string };

export type WithNumberValues<T> = { [key in keyof T]: number };

export interface AgentDeletionState {
  stateType: StateType.AgentDeletion;

  agents: NamedAgent[];
  options: AppOptions;

  selectedAgentName: string;
  isConfirmingDeletion: boolean;
}

export interface EvaluationState {
  stateType: StateType.Evaluation;

  agents: NamedAgent[];
  options: AppOptions;

  selectedAgentNames: [string, string];
  hasStartedEvaluation: boolean;
  firstAgentReward: undefined | number;
}

export interface TrainingAgentSelectionState {
  stateType: StateType.TrainingAgentSelection;

  agents: NamedAgent[];
  options: AppOptions;

  selectedAgentName: string;
  /**
   * Technically, all properties should be immutable,
   * but `opponentNames` specifically needs to be
   * immutable so we can assign the output of `arraySet.add()`
   * to it.
   */
  opponentNames: readonly string[];
}

export interface TrainingState {
  stateType: StateType.Training;

  agents: NamedAgent[];
  options: AppOptions;

  traineeName: string;
  opponentNames: readonly string[];
  cyclesCompleted: number;
  relativeRewardLists: RelativeReward[][];
  hasTrainingBeenTerminated: boolean;

  terminateTraining: () => void;
}

export interface RelativeReward {
  opponentName: string;
  reward: number;
}

export interface PlayState {
  stateType: StateType.Play;

  agents: NamedAgent[];
  options: AppOptions;

  opponentName: string;
  reward: number;
  hands: number;

  betState: BetState;
}

export type BetState = InitialBetState | FollowingBetState | MaxBetState;

export enum BetStateType {
  Initial,
  Following,
  Max,
}

export interface InitialBetState {
  betStateType: BetStateType.Initial;

  strength: number;
  betInputValue: string;
}

export interface FollowingBetState {
  betStateType: BetStateType.Following;

  strength: number;
  initialBet: number;
  betInputValue: string;
}

export interface MaxBetState {
  betStateType: BetStateType.Max;

  strength: number;
  initialBet: number;
  followingBet: number;
  betInputValue: string;
}

export interface GraphState {
  stateType: StateType.Graph;

  agents: NamedAgent[];
  options: AppOptions;

  graphedAgentName: string;
  graph: PolicyGraph;
}

export type PolicyGraph = LeaderGraph | FollowerGraph;

export enum PolicyGraphType {
  Leader,
  Follower,
}

export interface LeaderGraph {
  policyGraphType: PolicyGraphType.Leader;

  points: [number, number, number][];
  noise: number;
  inspectedStrength: number;
}

export interface FollowerGraph {
  policyGraphType: PolicyGraphType.Follower;

  points: [number, number, number][];
  noise: number;
  inspectedStrength: number;
  inspectedInitialBet: number;
}
