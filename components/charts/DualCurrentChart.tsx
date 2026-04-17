"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

import { Reading } from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

interface DualCurrentChartProps {
  history: Reading[];
  isPending?: boolean;
  hasSecondary?: boolean;
}

export function DualCurrentChart({
  history,
  isPending = false,
  hasSecondary = true
}: DualCurrentChartProps): JSX.Element {
  const recent = history.slice(-16);
  const primaryValues = recent.map((point) => point.current_ct1);
  const hasVariation =
    primaryValues.length > 1 &&
    primaryValues.some((value, _index, values) => value !== values[0]);
  return (
    <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-white/55">Current Comparison</p>
        <h3 className="mt-2 text-xl font-semibold text-white">CT1 vs CT2 flow trace</h3>
      </div>
      <div className="h-72">
        {isPending ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
            CT1 and CT2 chart will populate once current sensor data is added to Firebase.
          </div>
        ) : (
          <Line
            data={{
              labels: recent.map((point) =>
                new Date(point.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              ),
              datasets: [
                {
                  label: hasSecondary ? "CT1" : "Current",
                  data: recent.map((point) => point.current_ct1),
                  borderColor: "#4d92ff",
                  backgroundColor: "rgba(77,146,255,0.16)",
                  fill: true,
                  tension: 0.35,
                  pointRadius: 0
                }
              ].concat(
                hasSecondary
                  ? [
                      {
                        label: "CT2",
                        data: recent.map((point) => point.current_ct2),
                        borderColor: "#c9a227",
                        backgroundColor: "rgba(201,162,39,0.12)",
                        fill: true,
                        tension: 0.35,
                        pointRadius: 0
                      }
                    ]
                  : []
              )
              
            }}
            options={{
              animation: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: "rgba(255,255,255,0.75)"
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    color: "rgba(255,255,255,0.05)"
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
                  suggestedMax: hasVariation ? undefined : (primaryValues[0] ?? 0) + 1
                }
              }
            }}
          />
        )}
      </div>
      {!isPending ? (
        <p className="mt-3 text-xs text-white/55">
          {hasSecondary
            ? "Current traces remain steady unless incoming samples change."
            : hasVariation
              ? "Live current is mapped from your ESP32 `current` field. CT2 remains blank until a second current sensor is added."
              : "Current trace is flat because the incoming current value is unchanged. CT2 remains blank until a second sensor is added."}
        </p>
      ) : null}
    </div>
  );
}
