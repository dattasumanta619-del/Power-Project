"use client";

import { useEffect, useState } from "react";

import { subscribeToAlerts } from "@/lib/firebaseReads";
import { getMockSnapshot, subscribeToMockData } from "@/lib/mockData";
import { AlertEvent } from "@/lib/types";

interface UseAlertsResult {
  alerts: AlertEvent[];
  isLoading: boolean;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<AlertEvent[]>(getMockSnapshot().alerts);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cleanup = () => {};

    const startMockMode = (): void => {
      cleanup = subscribeToMockData((snapshot) => {
        setAlerts(snapshot.alerts);
        setIsLoading(false);
      });
    };

    const firebaseUnsubscribe = subscribeToAlerts(
      (nextAlerts) => {
        setAlerts(nextAlerts);
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

  return { alerts, isLoading };
}
