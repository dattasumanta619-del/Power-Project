import { onValue, ref, Unsubscribe } from "firebase/database";

import { database } from "@/lib/firebase";
import { getMockSnapshot, syncExternalReading } from "@/lib/mockData";
import { AlertEvent, AppConfig, Reading } from "@/lib/types";

function normalizeReading(value: unknown): Reading | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const base = getMockSnapshot().latest;

  const voltage =
    typeof raw.voltage === "number" ? raw.voltage : base.voltage;
  const currentCt1 =
    typeof raw.current_ct1 === "number"
      ? raw.current_ct1
      : typeof raw.current === "number"
        ? raw.current
        : base.current_ct1;
  const currentCt2 =
    typeof raw.current_ct2 === "number" ? raw.current_ct2 : base.current_ct2;
  const power =
    typeof raw.power === "number" ? raw.power : base.power;
  const powerFactor =
    typeof raw.power_factor === "number" ? raw.power_factor : base.power_factor;
  const energyKwh =
    typeof raw.energy_kwh === "number"
      ? raw.energy_kwh
      : typeof raw.energy === "number"
        ? raw.energy / 1000
        : base.energy_kwh;
  const temperature =
    typeof raw.temperature === "number" ? raw.temperature : base.temperature;
  const humidity =
    typeof raw.humidity === "number" ? raw.humidity : base.humidity;
  const differentialPercent =
    typeof raw.differential_percent === "number"
      ? raw.differential_percent
      : base.differential_percent;
  const anomalyFlag =
    typeof raw.anomaly_flag === "boolean" ? raw.anomaly_flag : base.anomaly_flag;
  const anomalyScore =
    typeof raw.anomaly_score === "number" ? raw.anomaly_score : base.anomaly_score;
  const hasSensorChange =
    voltage !== base.voltage ||
    currentCt1 !== base.current_ct1 ||
    currentCt2 !== base.current_ct2 ||
    power !== base.power ||
    powerFactor !== base.power_factor ||
    energyKwh !== base.energy_kwh ||
    temperature !== base.temperature ||
    humidity !== base.humidity ||
    differentialPercent !== base.differential_percent ||
    anomalyFlag !== base.anomaly_flag ||
    anomalyScore !== base.anomaly_score;
  const timestamp =
    typeof raw.timestamp === "number"
      ? raw.timestamp
      : hasSensorChange
        ? Date.now()
        : base.timestamp;

  if (typeof temperature !== "number" || typeof humidity !== "number") {
    return null;
  }

  return {
    voltage,
    current_ct1: currentCt1,
    current_ct2: currentCt2,
    power,
    power_factor: powerFactor,
    energy_kwh: energyKwh,
    temperature,
    humidity,
    differential_percent: differentialPercent,
    anomaly_flag: anomalyFlag,
    anomaly_score: anomalyScore,
    timestamp
  };
}

function normalizeAlerts(value: unknown): AlertEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is AlertEvent => {
    const typed = item as Partial<AlertEvent>;
    return (
      typeof typed?.id === "string" &&
      typeof typed?.title === "string" &&
      typeof typed?.message === "string" &&
      typeof typed?.severity === "string" &&
      typeof typed?.timestamp === "number"
    );
  });
}

function normalizeHistory(value: unknown): Reading[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeReading(item))
    .filter((item): item is Reading => item !== null);
}

function normalizeConfig(value: unknown): AppConfig | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as AppConfig;
  if (
    typeof raw.differentialThreshold !== "number" ||
    typeof raw.anomalyScoreThreshold !== "number" ||
    typeof raw.maxTemperature !== "number" ||
    typeof raw.humidityThreshold !== "number"
  ) {
    return null;
  }

  return raw;
}

export function subscribeToLatestReading(
  onData: (value: Reading) => void,
  onError: () => void
): Unsubscribe | null {
  if (!database) {
    const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

    if (
      typeof databaseUrl !== "string" ||
      databaseUrl.trim().length === 0 ||
      databaseUrl.includes("your_project")
    ) {
      return null;
    }

    let isActive = true;

    const fetchLatestReading = async (): Promise<void> => {
      try {
        const response = await fetch(`${databaseUrl}/readings/latest.json`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch public realtime reading");
        }

        const payload: unknown = await response.json();
        const reading = normalizeReading(payload);

        if (!reading || !isActive) {
          throw new Error("Invalid realtime reading payload");
        }

        syncExternalReading(reading);
        onData(reading);
      } catch {
        if (isActive) {
          onError();
        }
      }
    };

    void fetchLatestReading();
    const intervalId = setInterval(() => {
      void fetchLatestReading();
    }, 5000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }

  return onValue(
    ref(database, "/readings/latest/"),
    (snapshot) => {
      const reading = normalizeReading(snapshot.val());
      if (reading) {
        syncExternalReading(reading);
        onData(reading);
      } else {
        onError();
      }
    },
    () => onError()
  );
}

export function subscribeToHistory(
  onData: (value: Reading[]) => void,
  onError: () => void
): Unsubscribe | null {
  if (!database) {
    return null;
  }

  return onValue(
    ref(database, "/readings/history/"),
    (snapshot) => {
      const history = normalizeHistory(snapshot.val());
      if (history.length > 0) {
        onData(history);
      } else {
        onError();
      }
    },
    () => onError()
  );
}

export function subscribeToAlerts(
  onData: (value: AlertEvent[]) => void,
  onError: () => void
): Unsubscribe | null {
  if (!database) {
    return null;
  }

  return onValue(
    ref(database, "/alerts/"),
    (snapshot) => {
      const alerts = normalizeAlerts(snapshot.val());
      if (alerts.length > 0) {
        onData(alerts);
      } else {
        onError();
      }
    },
    () => onError()
  );
}

export function subscribeToRelayState(
  onData: (value: boolean) => void,
  onError: () => void
): Unsubscribe | null {
  if (!database) {
    return null;
  }

  return onValue(
    ref(database, "/device_status/relay_state"),
    (snapshot) => {
      const value = snapshot.val();
      if (typeof value === "boolean") {
        onData(value);
      } else {
        onError();
      }
    },
    () => onError()
  );
}

export function subscribeToConfig(
  onData: (value: AppConfig) => void,
  onError: () => void
): Unsubscribe | null {
  if (!database) {
    return null;
  }

  return onValue(
    ref(database, "/config/"),
    (snapshot) => {
      const config = normalizeConfig(snapshot.val());
      if (config) {
        onData(config);
      } else {
        onError();
      }
    },
    () => onError()
  );
}
