"use client";

import { useEffect, useState } from "react";

import { subscribeToLatestReading } from "@/lib/firebaseReads";
import { getMockSnapshot, subscribeToMockData } from "@/lib/mockData";
import { ConnectionStatus, Reading } from "@/lib/types";

interface UseRealtimeDataResult {
  latest: Reading;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
}

export function useRealtimeData(): UseRealtimeDataResult {
  const [latest, setLatest] = useState<Reading>(getMockSnapshot().latest);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("demo");

  useEffect(() => {
    let cleanup = () => {};

    const startMockMode = (): void => {
      setConnectionStatus("demo");
      cleanup = subscribeToMockData((snapshot) => {
        setLatest(snapshot.latest);
        setIsLoading(false);
      });
    };

    const firebaseUnsubscribe = subscribeToLatestReading(
      (reading) => {
        setLatest(reading);
        setConnectionStatus("connected");
        setIsLoading(false);
      },
      () => {
        startMockMode();
      }
    );

    if (firebaseUnsubscribe) {
      cleanup = firebaseUnsubscribe;
    } else {
      startMockMode();
    }

    return () => cleanup();
  }, []);

  return { latest, isLoading, connectionStatus };
}
