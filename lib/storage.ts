import * as SecureStore from "expo-secure-store";

const PID_KEY = "pid";

export async function getPid(): Promise<string | null> {
  return SecureStore.getItemAsync(PID_KEY);
}

export async function setPid(pid: string): Promise<void> {
  await SecureStore.setItemAsync(PID_KEY, pid);
}

export async function clearPid(): Promise<void> {
  await SecureStore.deleteItemAsync(PID_KEY);
}
