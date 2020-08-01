import { Agent } from "./game/types";
import { getAgent } from "./getAgent";
import {
  FollowerGraph,
  FollowerPolicyPoint,
  GraphState,
  LeaderGraph,
  LeaderPolicyPoint,
  PolicyGraphType,
} from "./types/state";

interface LeaderPolicyPointWithUnadjustedMaxBet extends LeaderPolicyPoint {
  unadjustedMaxBet: number;
}

export const CANVAS_SIZE = 800;

const SAMPLES = 20;
const STEP = 1 / SAMPLES;
const LINE_WIDTH = 3;
const INITIAL_BET_LINE_STYLE = "#ff000088";
const UNADJUSTED_MAX_BET_LINE_STYLE = "#00880088";
const MAX_BET_LINE_STYLE = "#0000ff88";

export function paintGraph(canvas: HTMLCanvasElement, state: GraphState): void {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;

  const agent = getAgent(state.agents, state.graphedAgentName);

  const { graph } = state;
  switch (graph.policyGraphType) {
    case PolicyGraphType.Leader:
      paintLeaderGraph(ctx, graph, agent);
      break;
    case PolicyGraphType.Follower:
      paintFollowerGraph(ctx, graph, agent);
      break;
  }
}

function paintLeaderGraph(
  ctx: CanvasRenderingContext2D,
  graph: LeaderGraph,
  agent: Agent
): void {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const points = getLeaderPolicyPoints(agent, graph.noise);

  ctx.lineWidth = LINE_WIDTH;

  const initialUnadjustedMaxBet0Y =
    CANVAS_SIZE - CANVAS_SIZE * points[0].unadjustedMaxBet;
  ctx.beginPath();
  ctx.moveTo(0, initialUnadjustedMaxBet0Y);

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const x = CANVAS_SIZE * point.strength;
    const y = CANVAS_SIZE - CANVAS_SIZE * point.unadjustedMaxBet;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = UNADJUSTED_MAX_BET_LINE_STYLE;
  ctx.stroke();

  const initialBet0Y = CANVAS_SIZE - CANVAS_SIZE * points[0].initialBet;
  ctx.beginPath();
  ctx.moveTo(0, initialBet0Y);

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const x = CANVAS_SIZE * point.strength;
    const y = CANVAS_SIZE - CANVAS_SIZE * point.initialBet;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = INITIAL_BET_LINE_STYLE;
  ctx.stroke();

  const maxBet0Y = CANVAS_SIZE - CANVAS_SIZE * points[0].maxBet;
  ctx.beginPath();
  ctx.moveTo(0, maxBet0Y);

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const x = CANVAS_SIZE * point.strength;
    const y = CANVAS_SIZE - CANVAS_SIZE * point.maxBet;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = MAX_BET_LINE_STYLE;
  ctx.stroke();
}

function getLeaderPolicyPoints(
  agent: Agent,
  noise: number
): LeaderPolicyPointWithUnadjustedMaxBet[] {
  const x0Arr = agent.lead(0, noise);
  const x0InitialBet = x0Arr[0];
  const x0UnadjustedMaxBet = x0Arr[1];
  const x0MaxBet = Math.max(x0InitialBet, x0UnadjustedMaxBet);
  const points: LeaderPolicyPointWithUnadjustedMaxBet[] = [
    {
      strength: 0,
      initialBet: x0InitialBet,
      maxBet: x0MaxBet,
      unadjustedMaxBet: x0UnadjustedMaxBet,
    },
  ];

  for (let strength = STEP; strength < 1; strength += STEP) {
    const arr = agent.lead(strength, noise);
    const initialBet = arr[0];
    const unadjustedMaxBet = arr[1];
    const maxBet = Math.max(initialBet, unadjustedMaxBet);
    points.push({ strength, initialBet, maxBet, unadjustedMaxBet });
  }

  const x1Arr = agent.lead(1, noise);
  const x1InitialBet = x1Arr[0];
  const x1UnadjustedMaxBet = x1Arr[1];
  const x1MaxBet = Math.max(x1InitialBet, x1UnadjustedMaxBet);
  points.push({
    strength: 1,
    initialBet: x1InitialBet,
    maxBet: x1MaxBet,
    unadjustedMaxBet: x1UnadjustedMaxBet,
  });

  return points;
}

function paintFollowerGraph(
  ctx: CanvasRenderingContext2D,
  graph: FollowerGraph,
  agent: Agent
): void {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const points = getFollowerPolicyPoints(agent, graph.noise);

  for (const point of points) {
    const x = CANVAS_SIZE * point.strength;
    const y = CANVAS_SIZE - CANVAS_SIZE * point.initialBet - CANVAS_SIZE * STEP;
    ctx.fillStyle = getDarkness(point.followingBet);
    ctx.fillRect(x, y, x + CANVAS_SIZE * STEP, y + CANVAS_SIZE * STEP);
  }
}

function getFollowerPolicyPoints(
  agent: Agent,
  noise: number
): FollowerPolicyPoint[] {
  const points: FollowerPolicyPoint[] = [];

  for (let strength = 0; strength < 1; strength += STEP) {
    for (let initialBet = 0; initialBet < 1; initialBet += STEP) {
      points.push({
        strength,
        initialBet,
        followingBet: agent.follow(strength, initialBet, noise),
      });
    }
  }

  return points;
}

function getDarkness(n: number): string {
  const byte = ((1 - n) * 255) | 0;
  return "rgb(" + byte + "," + byte + "," + byte + ")";
}
