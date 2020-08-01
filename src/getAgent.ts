import { Agent } from "./game/types";
import { NamedAgent } from "./types/state";

export function getAgent(agents: NamedAgent[], expectedName: string): Agent {
  for (const { name, agent } of agents) {
    if (expectedName === name) {
      return agent;
    }
  }

  throw new Error(
    "Cannot find agent named " +
      JSON.stringify(expectedName) +
      ". The only agents provided were: " +
      JSON.stringify(agents)
  );
}
