"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { Reading } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ConsumptionBarProps {
  history: Reading[];
  isPending?: boolean;
}

function buildHourlyConsumption(history: Reading[]): { labels: string[]; values: number[] } {
  const buckets = new Map<string, number>();

  history.slice(-24).forEach((item) => {
    const label = new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit"
    });
    buckets.set(label, Number(((buckets.get(label) ?? 0) + item.power * 0.1).toFixed(2)));
  });

  return {
    labels: Array.from(buckets.keys()),
    values: Array.from(buckets.values())
  };
}

export function ConsumptionBar({
  history,
  isPending = false
}: ConsumptionBarProps): JSX.Element {
  const chart = buildHourlyConsumption(history);
  const hasVariation =
    chart.values.length > 1 &&
    chart.values.some((value, index, values) => value !== values[0]);

  return (
    <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-white/55">24h Consumption</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Rolling energy load</h3>
      </div>
      <div className="h-72">
        {isPending ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
            Consumption bars are reserved for future real power and energy data.
          </div>
        ) : (
          <Bar
            data={{
              labels: chart.labels,
              datasets: [
                {
                  label: "kWh",
                  data: chart.values,
                  backgroundColor: "rgba(77,146,255,0.8)",
                  borderRadius: 8
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
                  suggestedMax: hasVariation ? undefined : (chart.values[0] ?? 0) + 1
                }
              }
            }}
          />
        )}
      </div>
      {!isPending ? (
        <p className="mt-3 text-xs text-white/55">
          {hasVariation
            ? "Bars update only when incoming power samples change."
            : "Stable load window: no material change in recent power samples."}
        </p>
      ) : null}
    </div>
  );
}
