"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useDataContext } from "@/context/DataContext";
import { AppConfig } from "@/lib/types";

export default function SettingsPage(): JSX.Element {
  const { config, saveConfig, connectionStatus } = useDataContext();
  const [form, setForm] = useState<AppConfig>(config);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleNumberChange =
    (
      key: keyof Pick<
        AppConfig,
        | "differentialThreshold"
        | "anomalyScoreThreshold"
        | "maxTemperature"
        | "humidityThreshold"
      >
    ) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setSaved(false);
      setForm((current) => ({
        ...current,
        [key]: Number(event.target.value)
      }));
    };

  const handleFirebaseChange =
    (key: keyof AppConfig["firebase"]) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setSaved(false);
      setForm((current) => ({
        ...current,
        firebase: {
          ...current.firebase,
          [key]: event.target.value
        }
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await saveConfig(form);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-powerCard/70 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.28em] text-white/45">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Configure thresholds and remote storage
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Save operational thresholds to <code>/config/</code> and keep your Firebase
          credentials aligned with the deployed realtime database.
        </p>
      </section>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="grid gap-6 xl:grid-cols-2"
      >
        <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
          <h3 className="text-xl font-semibold text-white">Thresholds</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-white/60">Differential threshold (%)</span>
              <input
                type="number"
                step="0.1"
                value={form.differentialThreshold}
                onChange={handleNumberChange("differentialThreshold")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400/40"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/60">Anomaly score threshold</span>
              <input
                type="number"
                step="0.01"
                value={form.anomalyScoreThreshold}
                onChange={handleNumberChange("anomalyScoreThreshold")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400/40"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/60">Max temperature (°C)</span>
              <input
                type="number"
                step="0.1"
                value={form.maxTemperature}
                onChange={handleNumberChange("maxTemperature")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400/40"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/60">Humidity threshold (%)</span>
              <input
                type="number"
                step="0.1"
                value={form.humidityThreshold}
                onChange={handleNumberChange("humidityThreshold")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400/40"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">Notification toggles</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Email", value: form.notifications.email },
                { label: "SMS", value: form.notifications.sms },
                { label: "Webhook", value: form.notifications.webhook }
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/60"
                >
                  {item.label}
                  <input type="checkbox" checked={item.value} disabled readOnly />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Firebase config</h3>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              {connectionStatus === "connected" ? "Live database" : "Demo fallback active"}
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {(
              [
                ["apiKey", "API Key"],
                ["authDomain", "Auth Domain"],
                ["databaseURL", "Database URL"],
                ["projectId", "Project ID"],
                ["storageBucket", "Storage Bucket"],
                ["messagingSenderId", "Messaging Sender ID"],
                ["appId", "App ID"]
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm text-white/60">{label}</span>
                <input
                  value={form.firebase[key]}
                  onChange={handleFirebaseChange(key)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400/40"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 xl:col-span-2">
          <button
            type="submit"
            className="rounded-2xl bg-powerPrimary px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Save Configuration
          </button>
          {saved ? (
            <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Configuration saved to <code>/config/</code>.
            </p>
          ) : (
            <p className="text-sm text-white/60">
              Changes are written with Firebase <code>set()</code> and mirrored locally for demo mode.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
