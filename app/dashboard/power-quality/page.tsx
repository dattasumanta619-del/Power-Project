"use client";

import { ConsumptionBar } from "@/components/charts/ConsumptionBar";
import { DualCurrentChart } from "@/components/charts/DualCurrentChart";
import { SineWave } from "@/components/charts/SineWave";
import { TempGauge } from "@/components/charts/TempGauge";
import { MetricCard } from "@/components/ui/MetricCard";
import { useDataContext } from "@/context/DataContext";

function getSeries(history: number[], count = 12): number[] {
  return history.slice(-count);
}

export default function PowerQualityPage(): JSX.Element {
  const { latest, history, alerts, realtimeLoading, historyLoading, alertsLoading } =
    useDataContext();

  const metrics = [
    {
      title: "Voltage",
      value: "",
      subtitle: "Phase-to-neutral stability",
      sparkline: [],
      accent: "blue" as const,
      isPending: true
    },
    {
      title: "Power",
      value: "",
      subtitle: "Real-time active load",
      sparkline: [],
      accent: "green" as const,
      isPending: true
    },
    {
      title: "Power Factor",
      value: "",
      subtitle: "Closer to 1.00 is healthier",
      sparkline: [],
      accent: "gold" as const,
      isPending: true
    },
    {
      title: "Energy",
      value: "",
      subtitle: "Accumulated feeder energy",
      sparkline: [],
      accent: "blue" as const,
      isPending: true
    },
    {
      title: "Temperature",
      value: `${latest.temperature.toFixed(1)} °C`,
      subtitle: "Cabinet thermal profile",
      sparkline: getSeries(history.map((item) => item.temperature)),
      accent: "red" as const
    },
    {
      title: "Humidity",
      value: `${latest.humidity.toFixed(1)} %`,
      subtitle: "Ambient enclosure moisture",
      sparkline: getSeries(history.map((item) => item.humidity)),
      accent: "green" as const
    }
  ];

  const isLoading = realtimeLoading || historyLoading || alertsLoading;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-powerCard/70 p-6 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/45">
              Power Quality Overview
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Live feeder health and waveform insight
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            {isLoading
              ? "Loading telemetry..."
              : `Live ESP32 update: ${new Date(latest.timestamp).toLocaleString()}`}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <SineWave voltage={latest.voltage} anomaly={latest.anomaly_flag} isPending />
        <TempGauge temperature={latest.temperature} history={history} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DualCurrentChart history={history} isPending />
        <ConsumptionBar history={history} isPending />
      </section>

      <section className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Event Table</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Recent grid events</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            0 live events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="px-3 py-3 font-medium">Time</th>
                <th className="px-3 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/5 text-white/60">
                <td className="px-3 py-4">--</td>
                <td className="px-3 py-4">No event feed connected yet</td>
                <td className="px-3 py-4">Pending</td>
                <td className="px-3 py-4">
                  Temperature and humidity are live. Voltage, current, energy, and event fields are intentionally blank until Firebase sources are added.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
