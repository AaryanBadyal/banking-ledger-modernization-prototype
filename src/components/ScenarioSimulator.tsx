import { useState } from "react";
import { Send, AlertTriangle, RefreshCw, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  icon: typeof Send;
  legacySteps: SimStep[];
  modularSteps: SimStep[];
}

interface SimStep {
  module: string;
  status: "success" | "warning" | "error";
  message: string;
}

const scenarios: Scenario[] = [
  {
    id: "send",
    name: "Send $100",
    icon: Send,
    legacySteps: [
      { module: "Payments", status: "success", message: "Transfer initiated" },
      { module: "Fraud Detection", status: "warning", message: "Check delayed — shared thread with Accounts" },
      { module: "Accounts", status: "warning", message: "Balance update slow — waiting on Fraud lock" },
      { module: "Notifications", status: "error", message: "Confirmation failed — blocked by cascading delay" },
    ],
    modularSteps: [
      { module: "Payments", status: "success", message: "Transfer initiated via API" },
      { module: "Fraud Detection", status: "success", message: "Risk check passed (independent service)" },
      { module: "Accounts", status: "success", message: "Balance updated via isolated request" },
      { module: "Notifications", status: "success", message: "Confirmation sent to user" },
    ],
  },
  {
    id: "fraud",
    name: "Suspicious Transaction",
    icon: AlertTriangle,
    legacySteps: [
      { module: "Fraud Detection", status: "warning", message: "Suspicious pattern detected" },
      { module: "Payments", status: "error", message: "All payments frozen — shared state" },
      { module: "Accounts", status: "error", message: "Account access disrupted" },
      { module: "Notifications", status: "error", message: "Alert system overloaded" },
    ],
    modularSteps: [
      { module: "Fraud Detection", status: "warning", message: "Suspicious pattern detected" },
      { module: "Payments", status: "success", message: "Only flagged transaction blocked" },
      { module: "Accounts", status: "success", message: "Account fully operational" },
      { module: "Notifications", status: "success", message: "User alerted of blocked transaction" },
    ],
  },
  {
    id: "update",
    name: "Update Payment System",
    icon: RefreshCw,
    legacySteps: [
      { module: "Payments", status: "warning", message: "Update deployed to monolith" },
      { module: "Accounts", status: "error", message: "Balance calculation broken by side effects" },
      { module: "Fraud Detection", status: "error", message: "Risk model invalidated" },
      { module: "Notifications", status: "error", message: "Alert templates corrupted" },
    ],
    modularSteps: [
      { module: "Payments", status: "success", message: "Module updated independently" },
      { module: "Accounts", status: "success", message: "No impact — API contract unchanged" },
      { module: "Fraud Detection", status: "success", message: "No impact — separate service" },
      { module: "Notifications", status: "success", message: "No impact — event-driven" },
    ],
  },
  {
    id: "failure",
    name: "Module Failure",
    icon: Zap,
    legacySteps: [
      { module: "Notifications", status: "error", message: "Service crashed" },
      { module: "Payments", status: "error", message: "Payments halted — depends on Notifications" },
      { module: "Accounts", status: "error", message: "Account queries timing out" },
      { module: "Fraud Detection", status: "error", message: "Fraud checks disabled" },
    ],
    modularSteps: [
      { module: "Notifications", status: "error", message: "Service crashed — isolated failure" },
      { module: "Payments", status: "success", message: "Payments continue normally" },
      { module: "Accounts", status: "success", message: "Account access unaffected" },
      { module: "Fraud Detection", status: "success", message: "Fraud checks running normally" },
    ],
  },
];

const ScenarioSimulator = () => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);

  const runScenario = (id: string) => {
    setActiveScenario(id);
    setRunning(true);
    setVisibleSteps(0);

    const scenario = scenarios.find((s) => s.id === id)!;
    const totalSteps = scenario.legacySteps.length;

    for (let i = 1; i <= totalSteps; i++) {
      setTimeout(() => {
        setVisibleSteps(i);
        if (i === totalSteps) setRunning(false);
      }, i * 600);
    }
  };

  const currentScenario = scenarios.find((s) => s.id === activeScenario);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-modular" />;
    if (status === "warning") return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-legacy" />;
  };

  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Scenario Simulator</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Run real-world banking scenarios and see how legacy and modular systems respond differently.
          </p>
        </div>

        {/* Scenario Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => runScenario(s.id)}
              disabled={running}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-all ${
                activeScenario === s.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
              } disabled:opacity-50`}
            >
              <s.icon className="w-4 h-4" />
              {s.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {currentScenario && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Legacy Result */}
            <div className="rounded-xl border border-legacy/20 bg-card p-6">
              <h3 className="text-sm font-semibold text-legacy uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Legacy Response
              </h3>
              <div className="space-y-3">
                {currentScenario.legacySteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/50 transition-all duration-300 ${
                      i < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    {i < visibleSteps ? <StatusIcon status={step.status} /> : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    <div>
                      <span className="text-xs font-medium text-foreground">{step.module}</span>
                      <p className="text-xs text-muted-foreground">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modular Result */}
            <div className="rounded-xl border border-modular/20 bg-card p-6">
              <h3 className="text-sm font-semibold text-modular uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Modular Response
              </h3>
              <div className="space-y-3">
                {currentScenario.modularSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/50 transition-all duration-300 ${
                      i < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    {i < visibleSteps ? <StatusIcon status={step.status} /> : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    <div>
                      <span className="text-xs font-medium text-foreground">{step.module}</span>
                      <p className="text-xs text-muted-foreground">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!currentScenario && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Select a scenario above to see the simulation</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScenarioSimulator;
