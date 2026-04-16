"use client";

import { useEffect, useState } from "react";

import { subscribeToHistory } from "@/lib/firebaseReads";
import { getMockSnapshot, subscribeToMockData } from "@/lib/mockData";
import { Reading } from "@/lib/types";

interface UseHistoryResult {
  history: Reading[];
  isLoading: boolean;
}

export function useHistory(): UseHistoryResult {
  const [history, setHistory] = useState<Reading[]>(getMockSnapshot().history);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cleanup = () => {};

    const startMockMode = (): void => {
      cleanup = subscribeToMockData((snapshot) => {
        setHistory(snapshot.history);
        setIsLoading(false);
      });
    };

    const firebaseUnsubscribe = subscribeToHistory(
      (nextHistory) => {
        setHistory(nextHistory);
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

  return { history, isLoading };
}
