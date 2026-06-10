import { ScorePanel } from "@/components/ScorePanel";
import { CapPanel } from "@/components/CapPanel";
import { GatedPoolWidget } from "@/components/GatedPoolWidget";
import { Section } from "@/components/ui/Section";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Section
        eyebrow="Dashboard"
        title="Behavioral trust, enforced on-chain"
        subtitle="TrustGate scores wallet behavior off-chain and writes it to a shared registry on Sui. A non-transferable TrustedAgentCap is minted when a wallet clears the threshold, and consumer protocols require a valid cap before authorizing high-stakes actions, demonstrated here by a capability-gated trading pool."
        width="wide"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ScorePanel />
          <CapPanel />
          <div className="lg:col-span-2">
            <GatedPoolWidget />
          </div>
        </div>
      </Section>
    </div>
  );
}
