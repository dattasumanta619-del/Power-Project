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
}

export function DualCurrentChart({
  history,
  isPending = false
}: DualCurrentChartProps): JSX.Element {
  const recent = history.slice(-16);
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
                  label: "CT1",
                  data: recent.map((point) => point.current_ct1),
                  borderColor: "#4d92ff",
                  backgroundColor: "rgba(77,146,255,0.16)",
                  fill: true,
                  tension: 0.35,
                  pointRadius: 0
                },
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
            }}
            options={{
              animation: {
                duration: 700
              },
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
                  }
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
