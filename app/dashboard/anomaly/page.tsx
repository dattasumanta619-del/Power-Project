"use client";

import { GaugeChart } from "@/components/ui/GaugeChart";
import { RelayToggle } from "@/components/ui/RelayToggle";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useDataContext } from "@/context/DataContext";

export default function AnomalyPage(): JSX.Element {
  const { latest } = useDataContext();

  return (
    <div className="space-y-6">
      <StatusBanner
        isAlert={latest.anomaly_flag}
        score={latest.anomaly_score}
        differential={latest.differential_percent}
        isPending
      />

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <GaugeChart
          label="Differential current"
          value={null}
          max={40}
          unit="%"
          tone="primary"
        />

        <div className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
          <p className="text-sm uppercase tracking-[0.2em] text-white/55">ML Model</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Hybrid anomaly classifier
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/55">Features</p>
              <p className="mt-2 text-lg font-semibold text-white">12 signals</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/55">Window</p>
              <p className="mt-2 text-lg font-semibold text-white">5 minutes</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/55">Response</p>
              <p className="mt-2 text-lg font-semibold text-white">Instant relay hint</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/70">
            The scoring model fuses CT imbalance, power-factor drift, thermal rise, and
            temporal consistency to reduce false positives caused by short transient
            events.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-2xl bg-powerGold/60 px-5 py-3 font-medium text-slate-950"
            >
              Waiting for live anomaly input
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              This section stays blank until genuine current, relay, and classifier values are added.
            </div>
          </div>
        </div>

        <RelayToggle enabled={false} onToggle={() => undefined} disabled />
      </section>

      <section className="rounded-2xl border border-white/10 bg-powerCard p-5 shadow-glow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Event Log</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Security and anomaly timeline
            </h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            Pending live event feed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="px-3 py-3 font-medium">Time</th>
                <th className="px-3 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Event</th>
                <th className="px-3 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/5 text-white/60">
                <td className="px-3 py-4">--</td>
                <td className="px-3 py-4">Pending</td>
                <td className="px-3 py-4">No anomaly events connected</td>
                <td className="px-3 py-4">
                  Add CT, relay, and anomaly paths in Firebase to populate this table.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
