"use client";

import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Tooltip
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, DoughnutController, Tooltip);

interface GaugeChartProps {
  label: string;
  value: number | null;
  max: number;
  unit: string;
  tone?: "primary" | "gold" | "danger" | "success";
}

const toneMap: Record<NonNullable<GaugeChartProps["tone"]>, string> = {
  primary: "#3b82f6",
  gold: "#c9a227",
  danger: "#ef5b5b",
  success: "#1fb16a"
};

export function GaugeChart({
  label,
  value,
  max,
  unit,
  tone = "primary"
}: GaugeChartProps): JSX.Element {
  const safeValue = value === null ? 0 : Math.max(0, Math.min(value, max));
  const percent = value === null ? 0 : (safeValue / max) * 100;
  const isPending = value === null;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
      <div className="mx-auto h-52 max-w-[220px]">
        <Doughnut
          data={{
            labels: [label, "Remaining"],
            datasets: [
              {
                data: [safeValue, Math.max(max - safeValue, 0)],
                backgroundColor: [toneMap[tone], "rgba(255,255,255,0.08)"],
                borderWidth: 0
              }
            ]
          }}
          options={{
            animation: {
              duration: 800
            },
            cutout: "75%",
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.parsed.toFixed(1)} ${unit}`
                }
              }
            }
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-3">
        <p className="text-4xl font-semibold text-white">
          {isPending ? "--" : safeValue.toFixed(1)}
        </p>
        <p className="text-sm uppercase tracking-[0.24em] text-white/60">{unit}</p>
        <p className="mt-3 text-xs text-white/55">
          {isPending ? "Awaiting live field" : label}
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: toneMap[tone] }}
        />
      </div>
    </div>
  );
}
