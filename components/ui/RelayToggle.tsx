"use client";

import clsx from "clsx";

interface RelayToggleProps {
  enabled: boolean;
  onToggle: (nextValue: boolean) => void;
  disabled?: boolean;
}

export function RelayToggle({
  enabled,
  onToggle,
  disabled = false
}: RelayToggleProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/55">Relay Control</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {disabled
              ? "Waiting for live relay status"
              : enabled
                ? "Distribution relay energized"
                : "Distribution relay isolated"}
          </h3>
          <p className="mt-2 text-sm text-white/70">
            {disabled
              ? "Provision kept for future Firebase relay writes."
              : "Cut or restore downstream power in response to theft events."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          disabled={disabled}
          className={clsx(
            "relative flex h-10 w-20 items-center rounded-full border px-1 transition-colors duration-300",
            disabled
              ? "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
              : enabled
              ? "border-emerald-400/40 bg-emerald-500/20"
              : "border-rose-400/40 bg-rose-500/20"
          )}
          aria-pressed={enabled}
        >
          <span
            className={clsx(
              "absolute h-8 w-8 rounded-full shadow-lg transition-transform duration-300",
              enabled
                ? "translate-x-10 bg-emerald-400"
                : "translate-x-0 bg-rose-400"
            )}
          />
        </button>
      </div>
    </div>
  );
}
