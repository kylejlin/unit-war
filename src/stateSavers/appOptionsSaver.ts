import { AppOptions, APP_OPTIONS_VERSION } from "../types/state";
import { LocalStorageKeys } from "./utils";

export function getSavedAppOptions(): undefined | AppOptions {
  const stateStr = localStorage.getItem(LocalStorageKeys.AppOptions);
  if (stateStr === null) {
    return;
  }
  const state: AppOptions = JSON.parse(stateStr);
  if (state.version !== APP_OPTIONS_VERSION) {
    return;
  }
  return state;
}

export function saveAppOptions(options: AppOptions): void {
  const stateStr = JSON.stringify(options);
  localStorage.setItem(LocalStorageKeys.AppOptions, stateStr);
}
