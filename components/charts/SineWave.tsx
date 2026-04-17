"use client";

import { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LineElement, LinearScale, PointElement, Filler, Tooltip);

interface SineWaveProps {
  voltage: number;
  anomaly: boolean;
  isPending?: boolean;
}

function generateSinePoints(voltage: number): number[] {
  return Array.from({ length: 120 }, (_, index) => {
    const x = (index / 120) * Math.PI * 4;
    return Number((Math.sin(x) * (voltage / 10)).toFixed(2));
  });
}

export function SineWave({
  voltage,
  anomaly,
  isPending = false
}: SineWaveProps): JSX.Element {
  const points = useMemo(() => generateSinePoints(voltage), [voltage]);

  return (
    <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/55">Voltage Profile</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Static waveform from latest voltage sample
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            isPending
              ? "bg-white/10 text-white/60"
              : anomaly
                ? "bg-rose-500/20 text-rose-100"
                : "bg-blue-500/20 text-blue-100"
          }`}
        >
          {isPending ? "Awaiting voltage feed" : anomaly ? "Abnormal condition" : "Stable sample"}
        </span>
      </div>

      <div className="h-72">
        {isPending ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
            Live waveform area reserved for future voltage/current Firebase data.
          </div>
        ) : (
          <Line
            data={{
              labels: points.map((_, index) => index.toString()),
              datasets: [
                {
                  data: points,
                  borderColor: anomaly ? "#ef5b5b" : "#4d92ff",
                  backgroundColor: "transparent",
                  fill: false,
                  borderWidth: 2,
                  pointRadius: 0,
                  tension: 0
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
                    color: "rgba(255,255,255,0.05)"
                  },
                  ticks: {
                    display: false
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
      {!isPending ? (
        <p className="mt-3 text-xs text-white/55">
          The waveform refreshes only when the voltage sample changes.
        </p>
      ) : null}
    </div>
  );
}
