import { AlertEvent, AppConfig, MockSnapshot, Reading } from "@/lib/types";

type SnapshotListener = (snapshot: MockSnapshot) => void;

const defaultConfig: AppConfig = {
  differentialThreshold: 12,
  anomalyScoreThreshold: 0.72,
  maxTemperature: 65,
  humidityThreshold: 78,
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "your_api_key",
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      "your_project.firebaseapp.com",
    databaseURL:
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
      "https://your_project-default-rtdb.firebaseio.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "your_project_id",
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      "your_project.appspot.com",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "your_sender_id",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "your_app_id"
  },
  notifications: {
    email: false,
    sms: false,
    webhook: false
  }
};

const listeners = new Set<SnapshotListener>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let anomalyDecayCounter = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createReading(
  previous: Reading | null,
  timestamp: number,
  overrides?: Partial<Reading>
): Reading {
  const baseVoltage = previous?.voltage ?? 229.6;
  const baseCurrent1 = previous?.current_ct1 ?? 18.4;
  const baseCurrent2 = previous?.current_ct2 ?? 17.9;
  const nextVoltage = clamp(baseVoltage + (Math.random() - 0.5) * 1.6, 223, 236);
  const nextCurrent1 = clamp(
    baseCurrent1 + (Math.random() - 0.5) * 1.7,
    10,
    32
  );
  const nextCurrent2 = clamp(
    baseCurrent2 + (Math.random() - 0.5) * 1.5,
    9,
    30
  );
  const nextPowerFactor = clamp(
    (previous?.power_factor ?? 0.95) + (Math.random() - 0.5) * 0.02,
    0.88,
    0.99
  );
  const nextPower = Number(
    (nextVoltage * ((nextCurrent1 + nextCurrent2) / 2) * nextPowerFactor / 1000).toFixed(2)
  );
  const nextEnergy = Number(
    ((previous?.energy_kwh ?? 1385) + nextPower * 0.05).toFixed(2)
  );
  const differential = Number(
    (Math.abs(nextCurrent1 - nextCurrent2) / Math.max(nextCurrent1, 1) * 100).toFixed(2)
  );
  const anomalyFlag = differential > defaultConfig.differentialThreshold + 2;
  const anomalyScore = Number(clamp(differential / 18, 0.18, 0.94).toFixed(2));

  return {
    voltage: Number(nextVoltage.toFixed(1)),
    current_ct1: Number(nextCurrent1.toFixed(2)),
    current_ct2: Number(nextCurrent2.toFixed(2)),
    power: nextPower,
    power_factor: Number(nextPowerFactor.toFixed(2)),
    energy_kwh: nextEnergy,
    temperature: Number(
      clamp((previous?.temperature ?? 37.6) + (Math.random() - 0.45) * 1.4, 31, 57).toFixed(1)
    ),
    humidity: Number(
      clamp((previous?.humidity ?? 49.5) + (Math.random() - 0.5) * 2, 36, 75).toFixed(1)
    ),
    differential_percent: differential,
    anomaly_flag: anomalyFlag,
    anomaly_score: anomalyScore,
    timestamp,
    ...overrides
  };
}

function seedHistory(points = 48): Reading[] {
  const history: Reading[] = [];
  const step = 30 * 60 * 1000;
  let current: Reading | null = null;
  const start = Date.now() - points * step;

  for (let index = 0; index < points; index += 1) {
    current = createReading(current, start + index * step);
    history.push(current);
  }

  return history;
}

function createAlertFromReading(reading: Reading, reason?: string): AlertEvent {
  const severity: AlertEvent["severity"] = reading.anomaly_flag ? "critical" : "warning";
  const defaultMessage = reading.anomaly_flag
    ? `Current mismatch at ${reading.differential_percent}% exceeds theft threshold.`
    : `Line stabilized at ${reading.voltage}V with PF ${reading.power_factor}.`;

  return {
    id: generateId("alert"),
    title: reading.anomaly_flag ? "Theft pattern detected" : "Power quality update",
    message: reason ?? defaultMessage,
    severity,
    timestamp: reading.timestamp
  };
}

const initialHistory = seedHistory();
let state: MockSnapshot = {
  latest: initialHistory[initialHistory.length - 1],
  history: initialHistory,
  alerts: [
    createAlertFromReading(initialHistory[initialHistory.length - 1]),
    {
      id: generateId("alert"),
      title: "Transformer thermal drift",
      message: "Cabinet temperature trended 3.2°C above rolling mean in the last hour.",
      severity: "warning",
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: generateId("alert"),
      title: "Meter heartbeat restored",
      message: "Telemetry resumed after a transient uplink interruption.",
      severity: "info",
      timestamp: Date.now() - 4 * 60 * 60 * 1000
    }
  ],
  relayState: true,
  config: defaultConfig
};

function emit(): void {
  const snapshot = getMockSnapshot();
  listeners.forEach((listener) => listener(snapshot));
}

function tick(): void {
  const timestamp = Date.now();
  const previous = state.latest;
  let nextReading = createReading(previous, timestamp);

  if (anomalyDecayCounter > 0) {
    anomalyDecayCounter -= 1;
    nextReading = {
      ...nextReading,
      current_ct1: Number((previous.current_ct1 + 2.4).toFixed(2)),
      current_ct2: Number(clamp(previous.current_ct2 - 1.8, 3, 18).toFixed(2)),
      differential_percent: Number(
        clamp(previous.differential_percent + 2.1, 18, 39).toFixed(2)
      ),
      anomaly_flag: true,
      anomaly_score: Number(clamp(previous.anomaly_score + 0.04, 0.78, 0.99).toFixed(2))
    };
  }

  const alertBuffer = [...state.alerts];
  const shouldLog = nextReading.anomaly_flag && !previous.anomaly_flag;
  if (shouldLog) {
    alertBuffer.unshift(createAlertFromReading(nextReading));
  }

  state = {
    ...state,
    latest: nextReading,
    history: [...state.history.slice(-47), nextReading],
    alerts: alertBuffer.slice(0, 14)
  };

  emit();
}

function ensureMockEngine(): void {
  if (intervalId !== null) {
    return;
  }

  intervalId = setInterval(tick, 2500);
}

export function getMockSnapshot(): MockSnapshot {
  return {
    latest: state.latest,
    history: [...state.history],
    alerts: [...state.alerts],
    relayState: state.relayState,
    config: {
      ...state.config,
      firebase: { ...state.config.firebase },
      notifications: { ...state.config.notifications }
    }
  };
}

export function subscribeToMockData(listener: SnapshotListener): () => void {
  ensureMockEngine();
  listeners.add(listener);
  listener(getMockSnapshot());

  return () => {
    listeners.delete(listener);
  };
}

export function updateMockRelayState(nextState: boolean): MockSnapshot {
  state = {
    ...state,
    relayState: nextState
  };
  emit();
  return getMockSnapshot();
}

export function updateMockConfig(nextConfig: AppConfig): MockSnapshot {
  state = {
    ...state,
    config: {
      ...nextConfig,
      firebase: { ...nextConfig.firebase },
      notifications: { ...nextConfig.notifications }
    }
  };
  emit();
  return getMockSnapshot();
}

export function syncExternalReading(reading: Reading): MockSnapshot {
  state = {
    ...state,
    latest: reading,
    history: [...state.history.slice(-47), reading]
  };
  emit();
  return getMockSnapshot();
}

export function simulateMockTheft(): MockSnapshot {
  anomalyDecayCounter = 6;
  const timestamp = Date.now();
  const theftReading: Reading = {
    ...createReading(state.latest, timestamp),
    current_ct1: Number((state.latest.current_ct1 + 5.8).toFixed(2)),
    current_ct2: Number(clamp(state.latest.current_ct2 - 6.1, 2.4, 14).toFixed(2)),
    differential_percent: 32.7,
    anomaly_flag: true,
    anomaly_score: 0.96,
    power: Number((state.latest.power + 1.8).toFixed(2)),
    temperature: Number((state.latest.temperature + 1.7).toFixed(1))
  };

  const alert = createAlertFromReading(
    theftReading,
    "Simulated theft injected: CT1/CT2 mismatch spiked and anomaly classifier tripped."
  );

  state = {
    ...state,
    latest: theftReading,
    history: [...state.history.slice(-47), theftReading],
    alerts: [alert, ...state.alerts].slice(0, 14)
  };

  emit();
  return getMockSnapshot();
}
