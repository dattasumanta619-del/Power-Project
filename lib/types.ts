export interface Reading {
  voltage: number;
  current_ct1: number;
  current_ct2: number;
  power: number;
  power_factor: number;
  energy_kwh: number;
  temperature: number;
  humidity: number;
  differential_percent: number;
  anomaly_flag: boolean;
  anomaly_score: number;
  timestamp: number;
}

export interface AlertEvent {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: number;
}

export interface FirebaseConfigFields {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppConfig {
  differentialThreshold: number;
  anomalyScoreThreshold: number;
  maxTemperature: number;
  humidityThreshold: number;
  firebase: FirebaseConfigFields;
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
}

export type ConnectionStatus = "connected" | "demo";

export interface MockSnapshot {
  latest: Reading;
  history: Reading[];
  alerts: AlertEvent[];
  relayState: boolean;
  config: AppConfig;
}

export interface DataContextValue {
  latest: Reading;
  history: Reading[];
  alerts: AlertEvent[];
  relayState: boolean;
  config: AppConfig;
  connectionStatus: ConnectionStatus;
  realtimeLoading: boolean;
  historyLoading: boolean;
  alertsLoading: boolean;
  toggleRelay: (nextState: boolean) => Promise<void>;
  simulateTheft: () => Promise<void>;
  saveConfig: (nextConfig: AppConfig) => Promise<void>;
}
