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

  return aTotal - bTotal;
}

function getLeaderReward(leader: Agent, follower: Agent, ante: number): number {
  const leaderStrength = Math.random();
  const leaderNoise = Math.random();
  const leaderOutput = leader.lead(leaderStrength, leaderNoise);
  const initialBid = Math.max(ante, leaderOutput[0]);
  const maxBid = Math.max(initialBid, leaderOutput[1]);

  const followerStrength = Math.random();
  const followerNoise = Math.random();
  const followBid = Math.max(
    ante,
    follower.follow(followerStrength, initialBid, followerNoise)
  );

  if (followBid < initialBid) {
    return ante;
  }

  if (followBid > maxBid) {
    return -initialBid;
  }

  if (leaderStrength > followerStrength) {
    return followBid;
  }
  if (leaderStrength < followerStrength) {
    return -followBid;
  }
  return 0;
}
