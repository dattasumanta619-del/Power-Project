"use client";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

import { Reading } from "@/lib/types";

ChartJS.register(
  ArcElement,
  DoughnutController,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface TempGaugeProps {
  temperature: number;
  history: Reading[];
}

export function TempGauge({
  temperature,
  history
}: TempGaugeProps): JSX.Element {
  const recent = history.slice(-10);
  const max = 80;
  const bounded = Math.min(temperature, max);
  const hasVariation =
    recent.length > 1 &&
    recent.some((item, _index, values) => item.temperature !== values[0]?.temperature);

  return (
    <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/55">
            Thermal Envelope
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Cabinet temperature and drift
          </h3>
        </div>
        <div className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-100">
          Active sensing
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
        <div className="relative mx-auto h-52 w-52">
          <Doughnut
            data={{
              labels: ["Temperature", "Headroom"],
              datasets: [
                {
                  data: [bounded, Math.max(max - bounded, 0)],
                  backgroundColor: ["#ef5b5b", "rgba(255,255,255,0.08)"],
                  borderWidth: 0
                }
              ]
            }}
            options={{
              animation: false,
              cutout: "72%",
              plugins: {
                legend: {
                  display: false
                }
              },
              maintainAspectRatio: false
            }}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-semibold text-white">{temperature.toFixed(1)}</p>
            <p className="text-sm uppercase tracking-[0.22em] text-white/55">C</p>
          </div>
        </div>

        <div className="h-52">
          <Line
            data={{
              labels: recent.map((item) =>
                new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              ),
              datasets: [
                {
                  data: recent.map((item) => item.temperature),
                  borderColor: "#ef5b5b",
                  backgroundColor: "rgba(239,91,91,0.14)",
                  fill: true,
                  pointRadius: hasVariation ? 1.5 : 0,
                  tension: hasVariation ? 0.12 : 0
                }
              ]
            }}
            options={{
              animation: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    color: "rgba(255,255,255,0.55)"
                  }
                },
                y: {
                  grid: {
                    color: "rgba(255,255,255,0.05)"
                  },
                  ticks: {
                    color: "rgba(255,255,255,0.55)"
                  },
                  suggestedMax: hasVariation ? undefined : temperature + 1
                }
              }
            }}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-white/55">
        {hasVariation
          ? "Thermal trend reflects true sample changes only."
          : "Temperature trace is flat because the incoming sensor reading is unchanged."}
      </p>
    </div>
  );
}
