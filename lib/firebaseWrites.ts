import { ref, set } from "firebase/database";

import { database } from "@/lib/firebase";
import { AlertEvent, AppConfig, Reading } from "@/lib/types";

export async function writeRelayState(nextState: boolean): Promise<boolean> {
  if (!database) {
    return false;
  }

  await set(ref(database, "/device_status/relay_state"), nextState);
  return true;
}

export async function writeConfig(nextConfig: AppConfig): Promise<boolean> {
  if (!database) {
    return false;
  }

  await set(ref(database, "/config/"), nextConfig);
  return true;
}

export async function writeLatestReading(reading: Reading): Promise<boolean> {
  if (!database) {
    return false;
  }

  await set(ref(database, "/readings/latest/"), reading);
  return true;
}

export async function writeHistory(history: Reading[]): Promise<boolean> {
  if (!database) {
    return false;
  }

  await set(ref(database, "/readings/history/"), history);
  return true;
}

export async function writeAlerts(alerts: AlertEvent[]): Promise<boolean> {
  if (!database) {
    return false;
  }

  await set(ref(database, "/alerts/"), alerts);
  return true;
}
