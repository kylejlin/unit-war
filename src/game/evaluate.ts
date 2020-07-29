import { Agent, EvaluationOptions } from "./types";

export function evaluate(
  a: Agent,
  b: Agent,
  options: EvaluationOptions
): number {
  let aTotal = 0;
  let bTotal = 0;

  const { hands, ante } = options;
  for (let i = 0; i < hands; i++) {
    if (Math.random() > 0.5) {
      const aReward = getLeaderReward(a, b, ante);
      aTotal += aReward;
      bTotal -= aReward;
    } else {
      const aReward = getLeaderReward(b, a, ante);
      aTotal += aReward;
      bTotal -= aReward;
    }
  }

  return (aTotal - bTotal) / 2;
}

function getLeaderReward(leader: Agent, follower: Agent, ante: number): number {
  const leaderStrength = Math.random();
  const leaderNoise = Math.random();
  const leaderOutput = leader.lead(leaderStrength, leaderNoise);
  const initialBet = Math.max(ante, leaderOutput[0]);
  const maxBet = Math.max(initialBet, leaderOutput[1]);

  const followerStrength = Math.random();
  const followerNoise = Math.random();
  const followingBet = Math.max(
    ante,
    follower.follow(followerStrength, initialBet, followerNoise)
  );

  if (followingBet < initialBet) {
    return ante;
  }

  if (followingBet > maxBet) {
    return -initialBet;
  }

  if (leaderStrength > followerStrength) {
    return followingBet;
  }
  if (leaderStrength < followerStrength) {
    return -followingBet;
  }
  return 0;
}
