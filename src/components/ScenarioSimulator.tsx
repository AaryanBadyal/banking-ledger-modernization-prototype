import { useState } from "react";
import { Send, AlertTriangle, RefreshCw, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface SimStep {
  module: string;
  status: "success" | "warning" | "error";
  message: string;
}

interface Scenario {
  id: string;
  name: string;
  icon: typeof Send;
  legacySteps: SimStep[];
  modularSteps: SimStep[];
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

const modulePositions: Record<string, { x: number; y: number }> = {
  Payments: { x: 50, y: 15 },
  "Fraud Detection": { x: 85, y: 40 },
  Accounts: { x: 15, y: 40 },
  Notifications: { x: 50, y: 70 },
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-modular flex-shrink-0" />;
  if (status === "warning") return <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />;
  return <XCircle className="w-4 h-4 text-legacy flex-shrink-0" />;
};

const MiniDiagram = ({ steps, visibleSteps, isLegacy }: { steps: SimStep[]; visibleSteps: number; isLegacy: boolean }) => {
  const mods = Object.keys(modulePositions);
  const activeModule = visibleSteps > 0 && visibleSteps <= steps.length ? steps[visibleSteps - 1].module : null;

  // In legacy mode, all connections exist (messy)
  const legacyConns = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  // In modular mode, clean connections
  const modularConns = [[0,1],[0,2],[0,3]];
  const conns = isLegacy ? legacyConns : modularConns;

  return (
    <div className="relative w-full h-36 rounded-lg bg-background border border-border mb-4">
      <svg className="absolute inset-0 w-full h-full">
        {conns.map(([a, b], i) => {
          const ma = mods[a], mb = mods[b];
          const pa = modulePositions[ma], pb = modulePositions[mb];
          const isAffected = isLegacy && visibleSteps > 0;
          return (
            <line
              key={i}
              x1={`${pa.x}%`} y1={`${pa.y}%`}
              x2={`${pb.x}%`} y2={`${pb.y}%`}
              stroke={isAffected ? "hsl(0 72% 50% / 0.3)" : isLegacy ? "hsl(0 0% 70% / 0.2)" : "hsl(165 65% 38% / 0.2)"}
              strokeWidth={isLegacy ? "2" : "1.5"}
              strokeDasharray={isLegacy ? "none" : "4 3"}
            />
          );
        })}
      </svg>
      {mods.map((name) => {
        const pos = modulePositions[name];
        const step = steps.find((s) => s.module === name);
        const stepIdx = steps.findIndex((s) => s.module === name);
        const isVisible = stepIdx < visibleSteps;
        const isActive = activeModule === name;
        let bg = "bg-secondary";
        let border = "border-border";
        if (isVisible && step) {
          if (step.status === "success") { bg = "bg-modular/10"; border = "border-modular/40"; }
          else if (step.status === "warning") { bg = "bg-warning/10"; border = "border-warning/40"; }
          else { bg = "bg-legacy/10"; border = "border-legacy/40"; }
        }
        return (
          <div
            key={name}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md border text-[10px] font-medium transition-all duration-300 ${bg} ${border} ${isActive ? "scale-110 shadow-md" : ""}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {name.length > 10 ? name.split(" ")[0] : name}
          </div>
        );
      })}
    </div>
  );
};

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
      }, i * 1200);
    }
  };

  const currentScenario = scenarios.find((s) => s.id === activeScenario);

  return (
    <section id="simulator" className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Scenario Simulator</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Run real-world banking scenarios and see how legacy and modular systems respond differently.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => runScenario(s.id)}
              disabled={running}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-all ${
                activeScenario === s.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/30"
              } disabled:opacity-50`}
            >
              <s.icon className="w-4 h-4" />
              {s.name}
            </button>
          ))}
        </div>

        {currentScenario && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Legacy */}
            <div className="rounded-xl border border-legacy/20 bg-background p-6">
              <h3 className="text-sm font-semibold text-legacy uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Legacy Response
              </h3>
              <MiniDiagram steps={currentScenario.legacySteps} visibleSteps={visibleSteps} isLegacy />
              <div className="space-y-3">
                {currentScenario.legacySteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/50 transition-all duration-300 ${
                      i < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    {i < visibleSteps ? <StatusIcon status={step.status} /> : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
                    <div>
                      <span className="text-xs font-medium text-foreground">{step.module}</span>
                      <p className="text-xs text-muted-foreground">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {visibleSteps >= currentScenario.legacySteps.length && (
                <div className="mt-4 p-3 rounded-lg bg-legacy/5 border border-legacy/15 text-xs text-legacy font-medium">
                  ⚠ {currentScenario.legacySteps.filter(s => s.status === "error").length} failures — cascading impact across tightly coupled modules
                </div>
              )}
            </div>

            {/* Modular */}
            <div className="rounded-xl border border-modular/20 bg-background p-6">
              <h3 className="text-sm font-semibold text-modular uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Modular Response
              </h3>
              <MiniDiagram steps={currentScenario.modularSteps} visibleSteps={visibleSteps} isLegacy={false} />
              <div className="space-y-3">
                {currentScenario.modularSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/50 transition-all duration-300 ${
                      i < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    {i < visibleSteps ? <StatusIcon status={step.status} /> : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
                    <div>
                      <span className="text-xs font-medium text-foreground">{step.module}</span>
                      <p className="text-xs text-muted-foreground">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {visibleSteps >= currentScenario.modularSteps.length && (
                <div className="mt-4 p-3 rounded-lg bg-modular/5 border border-modular/15 text-xs text-modular font-medium">
                  ✓ {currentScenario.modularSteps.filter(s => s.status === "success").length} modules stable — isolated boundaries prevent cascading failures
                </div>
              )}
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
