"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { useAlerts } from "@/hooks/useAlerts";
import { useHistory } from "@/hooks/useHistory";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import {
  subscribeToConfig,
  subscribeToRelayState
} from "@/lib/firebaseReads";
import {
  writeAlerts,
  writeConfig,
  writeHistory,
  writeLatestReading,
  writeRelayState
} from "@/lib/firebaseWrites";
import {
  getMockSnapshot,
  simulateMockTheft,
  subscribeToMockData,
  updateMockConfig,
  updateMockRelayState
} from "@/lib/mockData";
import { AppConfig, DataContextValue } from "@/lib/types";

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }): JSX.Element {
  const realtime = useRealtimeData();
  const historyState = useHistory();
  const alertsState = useAlerts();
  const initialSnapshot = getMockSnapshot();

  const [relayState, setRelayState] = useState<boolean>(initialSnapshot.relayState);
  const [config, setConfig] = useState<AppConfig>(initialSnapshot.config);
  const [optimisticLatest, setOptimisticLatest] = useState(initialSnapshot.latest);
  const [optimisticHistory, setOptimisticHistory] = useState(initialSnapshot.history);
  const [optimisticAlerts, setOptimisticAlerts] = useState(initialSnapshot.alerts);
  const [hasOptimisticOverride, setHasOptimisticOverride] = useState<boolean>(false);

  useEffect(() => {
    if (!hasOptimisticOverride) {
      return;
    }

    if (realtime.latest.timestamp >= optimisticLatest.timestamp) {
      setHasOptimisticOverride(false);
    }
  }, [hasOptimisticOverride, optimisticLatest.timestamp, realtime.latest.timestamp]);

  useEffect(() => {
    let cleanup = () => {};

    const startMockMode = (): void => {
      cleanup = subscribeToMockData((snapshot) => {
        setRelayState(snapshot.relayState);
        setConfig(snapshot.config);
      });
    };

    const relayUnsubscribe = subscribeToRelayState(
      (value) => setRelayState(value),
      () => startMockMode()
    );
    const configUnsubscribe = subscribeToConfig(
      (value) => setConfig(value),
      () => startMockMode()
    );

    if (!relayUnsubscribe || !configUnsubscribe) {
      startMockMode();
    } else {
      cleanup = () => {
        relayUnsubscribe();
        configUnsubscribe();
      };
    }

    return () => cleanup();
  }, []);

  const latest = hasOptimisticOverride ? optimisticLatest : realtime.latest;
  const history = hasOptimisticOverride ? optimisticHistory : historyState.history;
  const alerts = hasOptimisticOverride ? optimisticAlerts : alertsState.alerts;

  const toggleRelay = async (nextState: boolean): Promise<void> => {
    setRelayState(nextState);
    updateMockRelayState(nextState);

    try {
      await writeRelayState(nextState);
    } catch {
      setRelayState(updateMockRelayState(nextState).relayState);
    }
  };

  const saveConfigState = async (nextConfig: AppConfig): Promise<void> => {
    setConfig(nextConfig);
    updateMockConfig(nextConfig);

    try {
      await writeConfig(nextConfig);
    } catch {
      setConfig(updateMockConfig(nextConfig).config);
    }
  };

  const simulateTheftState = async (): Promise<void> => {
    const snapshot = simulateMockTheft();
    setOptimisticLatest(snapshot.latest);
    setOptimisticHistory(snapshot.history);
    setOptimisticAlerts(snapshot.alerts);
    setHasOptimisticOverride(true);

    try {
      await Promise.all([
        writeLatestReading(snapshot.latest),
        writeHistory(snapshot.history),
        writeAlerts(snapshot.alerts)
      ]);
    } catch {
      // Mock state is already updated, so the UI remains functional in demo mode.
    }
  };

  const value = useMemo<DataContextValue>(
    () => ({
      latest,
      history,
      alerts,
      relayState,
      config,
      connectionStatus: realtime.connectionStatus,
      realtimeLoading: realtime.isLoading,
      historyLoading: historyState.isLoading,
      alertsLoading: alertsState.isLoading,
      toggleRelay,
      simulateTheft: simulateTheftState,
      saveConfig: saveConfigState
    }),
    [
      alerts,
      alertsState.isLoading,
      config,
      history,
      historyState.isLoading,
      latest,
      realtime.connectionStatus,
      realtime.isLoading,
      relayState
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext(): DataContextValue {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }

  return context;
}
