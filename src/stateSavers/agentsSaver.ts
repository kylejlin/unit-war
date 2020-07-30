import { deserializeAgent } from "../agents";
import { NamedAgent } from "../types/state";
import { decodeBytes, encodeBytes } from "./byteStringifier";
import { LocalStorageKeys } from "./utils";
import * as arraySet from "../arraySet";

export function getSavedAgents(): undefined | NamedAgent[] {
  const agentNamesStr = localStorage.getItem(LocalStorageKeys.AgentNames);
  if (agentNamesStr === null) {
    return;
  }
  const agentNames: string[] = JSON.parse(agentNamesStr);
  return agentNames.map(
    (agentName): NamedAgent => {
      const agentStr = localStorage.getItem(
        LocalStorageKeys.AgentPrefix + agentName
      );
      if (agentStr === null) {
        throw new Error();
      }
      const agent = deserializeAgent(decodeBytes(agentStr));
      return { name: agentName, agent };
    }
  );
}

export function updateAgent({ name: agentName, agent }: NamedAgent): void {
  const agentStr = encodeBytes(new Uint8Array(agent.toArrayBuffer()));
  localStorage.setItem(LocalStorageKeys.AgentPrefix + agentName, agentStr);
}

export function addAgent({ name: agentName, agent }: NamedAgent): void {
  const currentAgentNamesStr = localStorage.getItem(
    LocalStorageKeys.AgentNames
  );
  const currentAgentNames: string[] =
    currentAgentNamesStr === null ? [] : JSON.parse(currentAgentNamesStr);
  const newAgentNames = arraySet.add(currentAgentNames, agentName);
  const newAgentNamesStr = JSON.stringify(newAgentNames);
  localStorage.setItem(LocalStorageKeys.AgentNames, newAgentNamesStr);

  const agentStr = encodeBytes(new Uint8Array(agent.toArrayBuffer()));
  localStorage.setItem(LocalStorageKeys.AgentPrefix + agentName, agentStr);
}

export function removeAgent(agentName: string): void {
  const currentAgentNamesStr = localStorage.getItem(
    LocalStorageKeys.AgentNames
  );
  const currentAgentNames: string[] =
    currentAgentNamesStr === null ? [] : JSON.parse(currentAgentNamesStr);
  const newAgentNames = arraySet.remove(currentAgentNames, agentName);
  const newAgentNamesStr = JSON.stringify(newAgentNames);
  localStorage.setItem(LocalStorageKeys.AgentNames, newAgentNamesStr);

  localStorage.removeItem(LocalStorageKeys.AgentPrefix + agentName);
}
