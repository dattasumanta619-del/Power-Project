"use client";

import clsx from "clsx";
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

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  accent?: "blue" | "gold" | "green" | "red";
  sparkline: number[];
  isPending?: boolean;
}

const accentMap: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  blue: "from-blue-500/30 to-blue-400/0 text-blue-100",
  gold: "from-yellow-500/30 to-yellow-400/0 text-yellow-100",
  green: "from-emerald-500/30 to-emerald-400/0 text-emerald-100",
  red: "from-rose-500/30 to-rose-400/0 text-rose-100"
};

export function MetricCard({
  title,
  value,
  subtitle,
  accent = "blue",
  sparkline,
  isPending = false
}: MetricCardProps): JSX.Element {
  const sparklineValues =
    sparkline.length > 1 ? sparkline : sparkline.length === 1 ? [sparkline[0], sparkline[0]] : [];
  const minValue = sparklineValues.length > 0 ? Math.min(...sparklineValues) : 0;
  const maxValue = sparklineValues.length > 0 ? Math.max(...sparklineValues) : 0;
  const valueRange = Number((maxValue - minValue).toFixed(4));
  const isStable = valueRange === 0;
  const borderColor =
    accent === "gold"
      ? "#c9a227"
      : accent === "green"
        ? "#1fb16a"
        : accent === "red"
          ? "#ef5b5b"
          : "#4d92ff";

  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-powerCard p-4 shadow-glow transition-transform duration-300 hover:-translate-y-1",
        "bg-gradient-to-br",
        accentMap[accent]
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/65">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {isPending ? "--" : value}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          {isPending ? "Pending" : "Live"}
        </span>
      </div>

      <div className="h-16">
        {isPending ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 text-xs text-white/40">
            Awaiting Firebase field
          </div>
        ) : (
          <Line
            data={{
              labels: sparklineValues.map((_, index) => index.toString()),
              datasets: [
                {
                  data: sparklineValues,
                  borderColor,
                  backgroundColor: "transparent",
                  fill: false,
                  borderWidth: 2,
                  pointRadius: isStable ? 0 : 1.5,
                  pointHoverRadius: 2,
                  tension: isStable ? 0 : 0.12
                }
              ]
            }}
            options={{
              animation: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: false
                }
              },
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  display: false
                },
                y: {
                  display: false,
                  suggestedMin: isStable
                    ? minValue - Math.max(Math.abs(minValue) * 0.01, 0.25)
                    : undefined,
                  suggestedMax: isStable
                    ? maxValue + Math.max(Math.abs(maxValue) * 0.01, 0.25)
                    : undefined
                }
              }
            }}
          />
        )}
      </div>

      <p className="mt-3 text-xs text-white/65">
        {isPending ? "Provision kept for future live Firebase mapping." : subtitle}
      </p>
      {!isPending ? (
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
          {isStable ? "Stable trace" : `Observed range ${valueRange.toFixed(2)}`}
        </p>
      ) : null}
    </div>
  );
}
