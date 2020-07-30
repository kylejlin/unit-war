import { Agent, TrainingCycleOptions } from "../game/types";

export type AppState =
  | AgentListState
  | OptionsState
  | EvaluationState
  | TrainingAgentSelectionState
  | TrainingState
  | PlayState
  | GraphState;

export enum StateType {
  AgentList,
  Options,
  Evaluation,
  TrainingAgentSelection,
  Training,
  Play,
  Graph,
}

export interface StateMap {
  [StateType.AgentList]: AgentListState;
  [StateType.Options]: OptionsState;
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

export interface EvaluationState {
  stateType: StateType.Evaluation;

  agents: NamedAgent[];
  options: AppOptions;

  selectedAgentNames: [string, string];
  hasStartedEvaluation: boolean;
  firstAgentReward: undefined | string;
}

export interface TrainingAgentSelectionState {
  stateType: StateType.TrainingAgentSelection;

  agents: NamedAgent[];
  options: AppOptions;

  opponentNames: string[];
}

export interface TrainingState {
  stateType: StateType.Training;

  agents: NamedAgent[];
  options: AppOptions;

  cyclesCompleted: number;
  mostRecentRelativeRewards: RelativeReward[];
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
