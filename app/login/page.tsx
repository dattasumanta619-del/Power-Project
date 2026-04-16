"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [username, setUsername] = useState<string>("student");
  const [password, setPassword] = useState<string>("student");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (sessionStorage.getItem("powerguard-auth") === "authenticated") {
      router.replace("/dashboard/power-quality");
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (username === "student" && password === "student") {
      sessionStorage.setItem("powerguard-auth", "authenticated");
      router.replace("/dashboard/power-quality");
      return;
    }

    setError("Invalid credentials. Use student / student.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-powerCard shadow-glow lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-yellow-500/10" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.36em] text-white/45">PowerGuard</p>
            <h1 className="mt-6 max-w-md text-5xl font-semibold leading-tight text-white">
              Grid intelligence built for safer distribution networks.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
              Monitor live waveforms, compare CT channels, detect theft anomalies, and
              control field relays from a single responsive command surface.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Live telemetry</p>
                <p className="mt-3 text-3xl font-semibold text-white">50Hz</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Detection latency</p>
                <p className="mt-3 text-3xl font-semibold text-white">&lt; 2.5s</p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm uppercase tracking-[0.36em] text-white/45">Secure Access</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Operator login</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Use the demo credentials to access the full PowerGuard control plane.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-white/65">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-blue-400/40 focus:bg-white/10"
                  placeholder="student"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/65">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-blue-400/40 focus:bg-white/10"
                  placeholder="student"
                />
              </label>

              {error ? (
                <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-powerPrimary px-5 py-3 font-medium text-white transition hover:bg-blue-500"
              >
                Enter dashboard
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
              Demo credentials: <span className="font-medium text-white">student / student</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
