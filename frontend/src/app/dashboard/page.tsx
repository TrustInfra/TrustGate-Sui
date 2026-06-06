import { Header } from "@/components/Header";
import { ScorePanel } from "@/components/ScorePanel";
import { CapPanel } from "@/components/CapPanel";
import { GatedPoolWidget } from "@/components/GatedPoolWidget";

export default function DashboardPage() {
  return (
    <div className="min-h-full">
      <Header />

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-wide">
            Behavioral trust, enforced on-chain
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            TrustGate scores wallet behavior off-chain and writes it to a shared
            registry on Sui. A non-transferable TrustedAgentCap is minted when a
            wallet clears the threshold, and consumer protocols require a valid
            cap before authorizing high-stakes actions — demonstrated here by a
            capability-gated trading pool.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ScorePanel />
          <CapPanel />
          <div className="md:col-span-2">
            <GatedPoolWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
