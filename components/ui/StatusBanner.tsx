"use client";

import clsx from "clsx";

interface StatusBannerProps {
  isAlert: boolean;
  score: number;
  differential: number;
  isPending?: boolean;
}

export function StatusBanner({
  isAlert,
  score,
  differential,
  isPending = false
}: StatusBannerProps): JSX.Element {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-5 shadow-glow transition-colors duration-500",
        isPending
          ? "border-white/15 bg-white/5"
          : isAlert
          ? "border-rose-400/40 bg-rose-500/10"
          : "border-emerald-400/30 bg-emerald-500/10"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-white/55">
            Theft Detection Status
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {isPending
              ? "Waiting for current, relay, and anomaly telemetry"
              : isAlert
                ? "Critical anomaly detected"
                : "System operating within baseline"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            {isPending
              ? "Temperature and humidity are live. All theft-detection fields are intentionally blank until their real Firebase values are added."
              : isAlert
                ? "CT imbalance, anomaly probability, and contextual power drift indicate potential unauthorized tapping."
                : "The model sees balanced load behavior, healthy relay continuity, and no active theft indicators."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs text-white/55">Anomaly Score</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {isPending ? "--" : score.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs text-white/55">CT Differential</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {isPending ? "--" : `${differential.toFixed(1)}%`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
