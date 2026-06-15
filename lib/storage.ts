import * as SecureStore from "expo-secure-store";

const PID_KEY = "pid";
const BASELINE_PID_KEY = "baselinePid";

export async function getPid(): Promise<string | null> {
  return SecureStore.getItemAsync(PID_KEY);
}

export async function setPid(pid: string): Promise<void> {
  await SecureStore.setItemAsync(PID_KEY, pid);
}

export async function clearPid(): Promise<void> {
  await SecureStore.deleteItemAsync(PID_KEY);
}

export async function getBaselinePid(): Promise<string | null> {
  return SecureStore.getItemAsync(BASELINE_PID_KEY);
}

export async function setBaselinePid(pid: string): Promise<void> {
  await SecureStore.setItemAsync(BASELINE_PID_KEY, pid);
}

const ENDLINE_PID_KEY = "endlinePid";

export async function getEndlinePid(): Promise<string | null> {
  return SecureStore.getItemAsync(ENDLINE_PID_KEY);
}

export async function setEndlinePid(pid: string): Promise<void> {
  await SecureStore.setItemAsync(ENDLINE_PID_KEY, pid);
}
