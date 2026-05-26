import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  CreditCard,
  Layers,
  RefreshCw,
  Shield,
  Wallet,
  XCircle,
  Network,
  TrendingUp,
} from "lucide-react";

type Mode = "legacy" | "modular";
type Health = "ok" | "warn" | "down";
type ModuleId = "payments" | "fraud" | "accounts" | "notifications";

interface ModuleDef {
  id: ModuleId;
  name: string;
  short: string;
  icon: typeof CreditCard;
  description: string;
  inputs: string[];
  outputs: string[];
  whyIsolate: string;
}

const MODULES: ModuleDef[] = [
  {
    id: "payments",
    name: "Payments",
    short: "PAY",
    icon: CreditCard,
    description: "Processes money transfers and handles all payment business logic.",
    inputs: ["Transfer requests", "Payment details", "Fraud approval status"],
    outputs: ["Transaction results", "Balance update events", "Notification triggers"],
    whyIsolate:
      "Payment rules change constantly. Isolating Payments lets engineers ship new rails without touching balances or alerts.",
  },
  {
    id: "fraud",
    name: "Fraud Detection",
    short: "FRD",
    icon: Shield,
    description: "Scores transactions for risk and approves or blocks them.",
    inputs: ["Transaction details", "Behavior signals", "Historical patterns"],
    outputs: ["Risk score", "Approve / deny decision", "Alert triggers"],
    whyIsolate:
      "Fraud models evolve weekly. An isolated service lets data scientists deploy new models with zero core risk.",
  },
  {
    id: "accounts",
    name: "Accounts",
    short: "ACC",
    icon: Wallet,
    description: "Owns balances, account lifecycle and ledger state.",
    inputs: ["Balance adjustment events", "Account queries", "Status changes"],
    outputs: ["Current balance", "Account status", "Transaction history"],
    whyIsolate:
      "Account data is the most sensitive layer. Isolation lets balance logic be audited and updated independently.",
  },
  {
    id: "notifications",
    name: "Notifications",
    short: "NTF",
    icon: Bell,
    description: "Delivers alerts, confirmations and warnings to customers.",
    inputs: ["Event triggers", "Templates", "User preferences"],
    outputs: ["Push", "Email", "SMS"],
    whyIsolate:
      "Channels and templates change often. Isolating Notifications lets you add WhatsApp or in-app with no business-logic risk.",
  },
];

// Node positions in % within the SVG canvas
const POS_MODULAR: Record<ModuleId, { x: number; y: number }> = {
  payments: { x: 22, y: 60 },
  fraud: { x: 41, y: 78 },
  accounts: { x: 60, y: 78 },
  notifications: { x: 78, y: 60 },
};

// API Gateway position (modular only)
const GATEWAY_POS = { x: 50, y: 28 };

const POS_LEGACY: Record<ModuleId, { x: number; y: number }> = {
  payments: { x: 40, y: 40 },
  fraud: { x: 60, y: 42 },
  accounts: { x: 42, y: 60 },
  notifications: { x: 58, y: 58 },
};

// Modular: API Gateway routes to every service
const MODULAR_EDGES: [ModuleId, ModuleId][] = [];
const GATEWAY_EDGES: ModuleId[] = ["payments", "fraud", "accounts", "notifications"];

// Legacy: tangled mesh — every node to every node
const LEGACY_EDGES: [ModuleId, ModuleId][] = [
  ["payments", "fraud"],
  ["payments", "accounts"],
  ["payments", "notifications"],
  ["fraud", "accounts"],
  ["fraud", "notifications"],
  ["accounts", "notifications"],
  // intentional crossing duplicates with curve offsets
  ["payments", "accounts"],
  ["fraud", "notifications"],
];

type Scenario = "traffic" | "update";

interface ScenarioConfig {
  id: Scenario;
  name: string;
  icon: typeof RefreshCw;
}

const SCENARIOS: ScenarioConfig[] = [
  { id: "traffic", name: "Scenario 1: Black Friday Traffic Spike", icon: TrendingUp },
  { id: "update", name: "Scenario 2: Mid-Day Code Update", icon: RefreshCw },
];

interface LogEntry {
  ts: string;
  level: "INFO" | "WARN" | "CRITICAL" | "OK";
  msg: string;
}

const now = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
};

const Dashboard = () => {
  const [mode, setMode] = useState<Mode>("modular");
  const [selected, setSelected] = useState<ModuleId | null>(null);
  const [log, setLog] = useState<LogEntry[]>([
    { ts: now(), level: "INFO", msg: "System initialized. Mode: MODULAR." },
    { ts: now(), level: "OK", msg: "All 4 services healthy." },
  ]);
  const [health, setHealth] = useState<Record<ModuleId, Health>>({
    payments: "ok",
    fraud: "ok",
    accounts: "ok",
    notifications: "ok",
  });
  const [activeEdge, setActiveEdge] = useState<number | null>(null);
  const [pulsePath, setPulsePath] = useState<ModuleId[]>([]);
  const [pulseIdx, setPulseIdx] = useState<number>(-1);
  const [monolithAlarm, setMonolithAlarm] = useState(false);
  const timers = useRef<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const positions = mode === "legacy" ? POS_LEGACY : POS_MODULAR;
  const edges = mode === "legacy" ? LEGACY_EDGES : MODULAR_EDGES;

  const addLog = (level: LogEntry["level"], msg: string) =>
    setLog((l) => [...l, { ts: now(), level, msg }]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const resetState = () => {
    clearTimers();
    setHealth({ payments: "ok", fraud: "ok", accounts: "ok", notifications: "ok" });
    setActiveEdge(null);
    setPulsePath([]);
    setPulseIdx(-1);
    setMonolithAlarm(false);
  };

  useEffect(() => {
    resetState();
    addLog("INFO", `Switched to ${mode.toUpperCase()} architecture.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => () => clearTimers(), []);

  const schedule = (delay: number, fn: () => void) => {
    const t = window.setTimeout(fn, delay);
    timers.current.push(t);
  };

  // --- Scenarios -----------------------------------------------------------
  const runScenario = (s: Scenario) => {
    resetState();
    if (mode === "modular") runModular(s);
    else runLegacy(s);
  };

  const runModular = (s: Scenario) => {
    if (s === "traffic") {
      addLog("INFO", "Black Friday: 12,400 req/s arriving at API Gateway.");
      schedule(400, () => addLog("INFO", "Gateway auto-scaling Payments + Fraud horizontally..."));
      // smooth parallel pulses across all 4 services
      const path: ModuleId[] = ["payments", "fraud", "accounts", "notifications"];
      setPulsePath(path);
      path.forEach((_, i) => {
        schedule(i * 700 + 600, () => setPulseIdx(i));
      });
      schedule(1200, () => addLog("OK", "Payments service scaled to 14 replicas. Latency stable."));
      schedule(2000, () => addLog("OK", "Fraud + Accounts handling load in parallel."));
      schedule(2800, () => addLog("OK", "All services 200 OK. Throughput: 12.4k rps. Zero errors."));
      schedule(3400, () => setPulseIdx(-1));
    }
    if (s === "update") {
      addLog("INFO", "Deploying payments-service:v2.4.1 via blue/green...");
      schedule(700, () => setHealth((h) => ({ ...h, payments: "down" })));
      schedule(800, () =>
        addLog("WARN", "Payments node taken offline for canary swap.")
      );
      schedule(1600, () =>
        addLog("INFO", "[INFO] Fault isolated by API Gateway. Blast radius: ISOLATED. Zero customer downtime.")
      );
      schedule(2400, () => setHealth((h) => ({ ...h, payments: "ok" })));
      schedule(2500, () => addLog("OK", "Payments v2.4.1 healthy. Traffic restored."));
      schedule(3100, () =>
        addLog("OK", "Fraud, Accounts, Notifications unaffected throughout deploy.")
      );
    }
  };

  const runLegacy = (s: Scenario) => {
    if (s === "traffic") {
      addLog("INFO", "Black Friday: 12,400 req/s hitting COBOL_MONOLITH_v3.2.");
      // monolith bogs down — flickering tangled edges
      let i = 0;
      const flick = () => {
        setActiveEdge(Math.floor(Math.random() * LEGACY_EDGES.length));
        i++;
        if (i < 12) schedule(260, flick);
      };
      flick();
      schedule(700, () => setHealth((h) => ({ ...h, payments: "warn" })));
      schedule(900, () => addLog("WARN", "Shared memory pool at 94%. Thread contention rising."));
      schedule(1400, () => setHealth((h) => ({ ...h, fraud: "warn", accounts: "warn" })));
      schedule(1600, () => addLog("WARN", "Fraud + Accounts threads starved waiting on shared locks."));
      schedule(2400, () => setHealth((h) => ({ payments: "warn", fraud: "warn", accounts: "warn", notifications: "down" })));
      schedule(2500, () =>
        addLog("CRITICAL", "Notifications queue overflowed shared memory. Service unresponsive.")
      );
      schedule(3200, () => {
        setActiveEdge(null);
        addLog("WARN", "Monolith degraded. Cannot scale individual modules.");
      });
    }
    if (s === "update") {
      addLog("INFO", "Hot-patching Payments module in COBOL_MONOLITH_v3.2...");
      schedule(500, () => setMonolithAlarm(true));
      schedule(600, () =>
        setHealth({ payments: "down", fraud: "down", accounts: "down", notifications: "down" })
      );
      schedule(700, () =>
        addLog("CRITICAL", "[CRITICAL] Global system outage. Blast radius: GLOBAL. Bet-the-bank risk realized.")
      );
      schedule(1500, () =>
        addLog("CRITICAL", "COBOL_MONOLITH_v3.2: SIGSEGV in shared memory segment.")
      );
      schedule(2300, () => addLog("CRITICAL", "All 4 modules unresponsive. Failover unavailable."));
      schedule(3100, () => addLog("WARN", "Manual rollback required. ETA 45 minutes."));
    }
  };

  // --- Helpers -------------------------------------------------------------
  const selectedModule = useMemo(
    () => MODULES.find((m) => m.id === selected) ?? null,
    [selected]
  );

  // --- Render --------------------------------------------------------------
  return (
    <div className="h-screen w-screen flex flex-col bg-[hsl(222_30%_7%)] text-slate-200 font-sans overflow-hidden">
      <Header mode={mode} setMode={setMode} />
      <div className="flex-1 grid grid-cols-[320px_1fr_360px] gap-3 p-3 min-h-0">
        {/* LEFT PANEL */}
        <LeftPanel runScenario={runScenario} log={log} logRef={logRef} mode={mode} />

        {/* CENTER CANVAS */}
        <CenterCanvas
          mode={mode}
          positions={positions}
          edges={edges}
          health={health}
          activeEdge={activeEdge}
          pulsePath={pulsePath}
          pulseIdx={pulseIdx}
          monolithAlarm={monolithAlarm}
          selected={selected}
          onSelect={setSelected}
        />

        {/* RIGHT PANEL */}
        <RightPanel selectedModule={selectedModule} mode={mode} health={health} onClear={() => setSelected(null)} />
      </div>
    </div>
  );
};

// ============================================================================
// HEADER
// ============================================================================
const Header = ({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) => (
  <header className="h-14 flex items-center justify-between px-5 border-b border-slate-800 bg-[hsl(222_32%_9%)]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
        <Layers className="w-4 h-4 text-slate-900" />
      </div>
      <div>
        <div className="text-sm font-semibold tracking-tight text-slate-100">
          Modular Banking System
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Architecture Console · v0.1
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Console live
      </div>
      <div className="flex p-0.5 rounded-md bg-slate-900 border border-slate-800">
        {(["legacy", "modular"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              mode === m
                ? m === "legacy"
                  ? "bg-red-500/15 text-red-300 shadow-inner"
                  : "bg-teal-500/15 text-teal-300 shadow-inner"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {m === "legacy" ? "Legacy Mode" : "Modular Mode"}
          </button>
        ))}
      </div>
    </div>
  </header>
);

// ============================================================================
// LEFT PANEL
// ============================================================================
const LeftPanel = ({
  runScenario,
  log,
  logRef,
  mode,
}: {
  runScenario: (s: Scenario) => void;
  log: LogEntry[];
  logRef: React.RefObject<HTMLDivElement>;
  mode: Mode;
}) => (
  <aside className="flex flex-col gap-3 min-h-0">
    <Panel title="Scenario Simulator" subtitle="Trigger real-world events">
      <div className="flex flex-col gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => runScenario(s.id)}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-md bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 transition-all text-left"
          >
            <span className="w-7 h-7 rounded bg-slate-800 group-hover:bg-sky-500/15 flex items-center justify-center transition-colors">
              <s.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-300" />
            </span>
            <span className="text-xs font-medium text-slate-200">{s.name}</span>
          </button>
        ))}
      </div>
    </Panel>

    <Panel title="Live System Event Log" subtitle={mode === "legacy" ? "stream :: monolith.log" : "stream :: gateway.log"} flex>
      <div
        ref={logRef}
        className="flex-1 min-h-0 overflow-y-auto rounded bg-black/60 border border-slate-800 p-2.5 font-mono text-[10.5px] leading-relaxed"
      >
        {log.map((e, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-slate-600">{e.ts}</span>
            <span
              className={
                e.level === "CRITICAL"
                  ? "text-red-400"
                  : e.level === "WARN"
                  ? "text-amber-300"
                  : e.level === "OK"
                  ? "text-emerald-300"
                  : "text-sky-300"
              }
            >
              [{e.level}]
            </span>
            <span className="text-slate-300 break-words flex-1">{e.msg}</span>
          </div>
        ))}
      </div>
    </Panel>
  </aside>
);

// ============================================================================
// PANEL WRAPPER
// ============================================================================
const Panel = ({
  title,
  subtitle,
  children,
  flex,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  flex?: boolean;
}) => (
  <section
    className={`rounded-lg border border-slate-800 bg-[hsl(222_32%_9%)] flex flex-col min-h-0 ${
      flex ? "flex-1" : ""
    }`}
  >
    <header className="px-3.5 py-2.5 border-b border-slate-800/80 flex items-baseline justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
        {title}
      </h3>
      {subtitle && (
        <span className="text-[9.5px] uppercase tracking-wider text-slate-600 font-mono">
          {subtitle}
        </span>
      )}
    </header>
    <div className={`p-3 ${flex ? "flex-1 min-h-0 flex flex-col" : ""}`}>{children}</div>
  </section>
);

// ============================================================================
// CENTER CANVAS
// ============================================================================
const CenterCanvas = ({
  mode,
  positions,
  edges,
  health,
  activeEdge,
  pulsePath,
  pulseIdx,
  monolithAlarm,
  selected,
  onSelect,
}: {
  mode: Mode;
  positions: Record<ModuleId, { x: number; y: number }>;
  edges: [ModuleId, ModuleId][];
  health: Record<ModuleId, Health>;
  activeEdge: number | null;
  pulsePath: ModuleId[];
  pulseIdx: number;
  monolithAlarm: boolean;
  selected: ModuleId | null;
  onSelect: (id: ModuleId | null) => void;
}) => {
  // figure out which directional segment is currently lit by the pulse
  const litSegment =
    pulseIdx >= 0 && pulseIdx < pulsePath.length - 1
      ? ([pulsePath[pulseIdx], pulsePath[pulseIdx + 1]] as [ModuleId, ModuleId])
      : null;

  return (
    <section className="rounded-lg border border-slate-800 bg-[hsl(222_34%_8%)] relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(148 163 184) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(222_34%_8%)_85%)]" />

      {/* Header strip */}
      <div className="absolute top-0 left-0 right-0 px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Topology
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            {mode === "legacy" ? "// monolith.core" : "// service-mesh.api"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <Activity className="w-3 h-3" />
          {mode === "legacy" ? "TIGHTLY COUPLED" : "LOOSELY COUPLED"}
        </div>
      </div>

      {/* Guide banner */}
      <div className="absolute top-9 left-0 right-0 px-4 z-10">
        <div className="mx-auto max-w-2xl rounded-md border border-sky-500/20 bg-sky-500/5 px-3 py-1.5 text-[10.5px] text-sky-200/90 text-center font-mono">
          To test: select <span className="text-red-300">Legacy Mode</span> and trigger an event, then switch to <span className="text-teal-300">Modular Mode</span> to see the architectural defense.
        </div>
      </div>

      {/* SVG layer */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker id="arrow-modular" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="rgb(45 212 191)" opacity="0.7" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="rgb(74 222 128)" />
          </marker>
          <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(167 243 208)" stopOpacity="1" />
            <stop offset="60%" stopColor="rgb(74 222 128)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(45 212 191)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pulse-grad-legacy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(248 113 113)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {edges.map(([a, b], i) => {
          const pa = positions[a];
          const pb = positions[b];
          const isLit =
            litSegment &&
            ((litSegment[0] === a && litSegment[1] === b) ||
              (litSegment[0] === b && litSegment[1] === a));
          const isActiveLegacy = mode === "legacy" && activeEdge === i;
          const stroke =
            mode === "legacy"
              ? monolithAlarm
                ? "rgb(248 113 113)"
                : isActiveLegacy
                ? "rgb(251 191 36)"
                : "rgb(100 116 139)"
              : isLit
              ? "rgb(74 222 128)"
              : "rgb(45 212 191)";
          const opacity = mode === "legacy" ? (isActiveLegacy ? 0.9 : 0.45) : isLit ? 1 : 0.35;
          // curved path so multiple edges between same nodes don't overlap
          const mx = (pa.x + pb.x) / 2;
          const my = (pa.y + pb.y) / 2;
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const off = mode === "legacy" ? (i % 2 === 0 ? 6 : -6) + (i * 1.5 - 4) : 0;
          const cx = mx + nx * off;
          const cy = my + ny * off;
          const d = mode === "legacy"
            ? `M ${pa.x} ${pa.y} Q ${cx} ${cy} ${pb.x} ${pb.y}`
            : `M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`;
          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={isLit ? 0.7 : 0.4}
                strokeDasharray={mode === "modular" ? (isLit ? "none" : "1.2 1") : "none"}
                opacity={opacity}
                style={{ transition: "stroke 0.25s, opacity 0.25s, stroke-width 0.25s" }}
                markerEnd={mode === "modular" ? (isLit ? "url(#arrow-active)" : "url(#arrow-modular)") : undefined}
              />
              {isLit && (
                <circle r="0.9" fill="rgb(134 239 172)">
                  <animateMotion dur="0.7s" repeatCount="1" path={d} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Gateway → service edges (modular only) */}
        {mode === "modular" &&
          GATEWAY_EDGES.map((target, i) => {
            const pa = GATEWAY_POS;
            const pb = positions[target];
            const isLit = pulseIdx >= 0 && pulsePath[pulseIdx] === target;
            const d = `M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`;
            return (
              <g key={`gw-${i}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={isLit ? "rgb(74 222 128)" : "rgb(45 212 191)"}
                  strokeWidth={isLit ? 0.7 : 0.4}
                  strokeDasharray={isLit ? "none" : "1.2 1"}
                  opacity={isLit ? 1 : 0.4}
                  style={{ transition: "stroke 0.25s, opacity 0.25s, stroke-width 0.25s" }}
                  markerEnd={isLit ? "url(#arrow-active)" : "url(#arrow-modular)"}
                />
                {isLit && (
                  <circle r="0.9" fill="rgb(134 239 172)">
                    <animateMotion dur="0.6s" repeatCount="1" path={d} />
                  </circle>
                )}
              </g>
            );
          })}
      </svg>

      {/* Monolith container (legacy only) */}
      {mode === "legacy" && (
        <div
          className={`absolute rounded-xl border-2 transition-all duration-300 ${
            monolithAlarm
              ? "border-red-500 bg-red-500/10 animate-pulse"
              : "border-slate-700 bg-slate-900/40"
          }`}
          style={{
            left: "20%",
            top: "25%",
            width: "60%",
            height: "55%",
          }}
        >
          <div className="absolute -top-2.5 left-4 px-2 bg-[hsl(222_34%_8%)] text-[9px] uppercase tracking-[0.2em] text-slate-500 font-mono">
            COBOL Monolith Core · v3.2
          </div>
        </div>
      )}

      {/* API Gateway node (modular only) */}
      {mode === "modular" && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${GATEWAY_POS.x}%`, top: `${GATEWAY_POS.y}%` }}
        >
          <div className="relative w-[160px] rounded-lg bg-gradient-to-br from-sky-500/15 to-teal-500/10 border border-sky-400/50 shadow-[0_0_30px_-6px_rgb(56_189_248/0.5)] px-3 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-sky-500/20 flex items-center justify-center">
                  <Network className="w-3 h-3 text-sky-200" />
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-sky-300/80">
                  GW
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgb(74_222_128/0.8)] animate-pulse" />
            </div>
            <div className="text-[12px] font-semibold text-slate-100 leading-tight">
              API Gateway
            </div>
            <div className="text-[9.5px] text-sky-300/70 font-mono mt-0.5">
              routes · auth · rate-limit
            </div>
          </div>
        </div>
      )}

      {/* Nodes */}
      {MODULES.map((m) => {
        const pos = positions[m.id];
        const h = health[m.id];
        const isSelected = selected === m.id;
        const isPulsing =
          pulsePath.includes(m.id) && pulsePath.indexOf(m.id) === pulseIdx;

        const colorRing =
          h === "down"
            ? "border-red-500 shadow-[0_0_30px_-5px_rgb(239_68_68/0.6)]"
            : h === "warn"
            ? "border-amber-400 shadow-[0_0_24px_-6px_rgb(251_191_36/0.5)]"
            : mode === "modular"
            ? "border-teal-400/60 shadow-[0_0_24px_-8px_rgb(45_212_191/0.5)]"
            : "border-slate-600";

        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(isSelected ? null : m.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-500 ${
              isPulsing ? "scale-110" : ""
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`relative w-[124px] rounded-lg bg-[hsl(222_32%_11%)] border ${colorRing} px-3 py-2.5 text-left transition-all ${
                isSelected ? "ring-2 ring-sky-400/60" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center">
                    <Icon className="w-3 h-3 text-slate-300" />
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    {m.short}
                  </span>
                </div>
                <HealthDot h={h} />
              </div>
              <div className="text-[12px] font-semibold text-slate-100 leading-tight">
                {m.name}
              </div>
              <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                {h === "ok" ? "200 OK" : h === "warn" ? "503 degraded" : "500 down"}
              </div>
              {isPulsing && (
                <span className="absolute inset-0 rounded-lg border-2 border-emerald-400 animate-ping pointer-events-none" />
              )}
            </div>
          </button>
        );
      })}

      {/* Legend bottom */}
      <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[9.5px] font-mono text-slate-600">
        <span>nodes: 4 · edges: {edges.length}</span>
        <span>{mode === "legacy" ? "shared memory · single deploy" : "stateless services · independent deploy"}</span>
      </div>
    </section>
  );
};

const HealthDot = ({ h }: { h: Health }) => (
  <span
    className={`w-1.5 h-1.5 rounded-full ${
      h === "ok"
        ? "bg-emerald-400 shadow-[0_0_6px_rgb(74_222_128/0.8)]"
        : h === "warn"
        ? "bg-amber-400 shadow-[0_0_6px_rgb(251_191_36/0.8)]"
        : "bg-red-500 shadow-[0_0_8px_rgb(239_68_68/0.9)]"
    }`}
  />
);

// ============================================================================
// RIGHT PANEL
// ============================================================================
const RightPanel = ({
  selectedModule,
  mode,
  health,
  onClear,
}: {
  selectedModule: ModuleDef | null;
  mode: Mode;
  health: Record<ModuleId, Health>;
  onClear: () => void;
}) => (
  <aside className="flex flex-col gap-3 min-h-0">
    {!selectedModule ? (
      <Panel title="Why This Matters" subtitle="briefing" flex>
        <div className="flex-1 overflow-y-auto space-y-3 text-[12px] leading-relaxed text-slate-400">
          <p>
            Legacy banking software is built as a <span className="text-slate-200">tightly coupled monolith</span>.
            One change can crash everything. Updates are slow, risky, and expensive.
          </p>
          <p>
            A <span className="text-teal-300">modular architecture</span> splits the system into
            independent services that communicate over clean APIs. Each module can be deployed,
            scaled, and failed independently.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Stat label="Deploy risk" legacy="HIGH" modular="LOW" />
            <Stat label="Blast radius" legacy="GLOBAL" modular="ISOLATED" />
            <Stat label="Time to ship" legacy="WEEKS" modular="HOURS" />
            <Stat label="Mean recovery" legacy="HOURS" modular="SECONDS" />
          </div>
          <div className="pt-2 text-[11px] text-slate-500 italic">
            Click any node in the topology to inspect its contract.
          </div>
        </div>
      </Panel>
    ) : (
      <Panel
        title={selectedModule.name}
        subtitle={`module · ${selectedModule.short}`}
        flex
      >
        <div className="flex-1 overflow-y-auto space-y-4 text-[12px]">
          <div className="flex items-center justify-between">
            <StatusPill h={health[selectedModule.id]} />
            <button
              onClick={onClear}
              className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-300"
            >
              close ×
            </button>
          </div>

          <p className="text-slate-400 leading-relaxed">{selectedModule.description}</p>

          <Block title="Inputs" items={selectedModule.inputs} accent="sky" />
          <Block title="Outputs" items={selectedModule.outputs} accent="teal" />

          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">
              Architectural Health · {mode}
            </div>
            <div
              className={`rounded-md border px-3 py-2.5 text-[11.5px] leading-relaxed ${
                mode === "legacy"
                  ? "border-red-500/30 bg-red-500/5 text-red-200"
                  : "border-teal-400/30 bg-teal-400/5 text-teal-100"
              }`}
            >
              {mode === "legacy" ? (
                <span>
                  <strong className="text-red-300">Coupled.</strong> Lives inside the monolith.
                  Any change here can ripple to every other module. Cannot be deployed alone.
                </span>
              ) : (
                <span>
                  <strong className="text-teal-200">Isolated.</strong> Runs as an independent
                  service behind the API gateway. Independently deployable and resilient to
                  neighbor failures.
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">
              Why Isolate
            </div>
            <p className="text-slate-400 text-[11.5px] leading-relaxed italic">
              {selectedModule.whyIsolate}
            </p>
          </div>
        </div>
      </Panel>
    )}
  </aside>
);

const Stat = ({ label, legacy, modular }: { label: string; legacy: string; modular: string }) => (
  <div className="rounded-md border border-slate-800 bg-slate-900/40 p-2">
    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
    <div className="flex items-center gap-1.5 text-[10px] font-mono">
      <span className="text-red-300">{legacy}</span>
      <span className="text-slate-600">→</span>
      <span className="text-teal-300">{modular}</span>
    </div>
  </div>
);

const Block = ({ title, items, accent }: { title: string; items: string[]; accent: "sky" | "teal" }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">{title}</div>
    <ul className="space-y-1">
      {items.map((i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-[11.5px] text-slate-300 font-mono"
        >
          <span
            className={`mt-1.5 w-1 h-1 rounded-full ${
              accent === "sky" ? "bg-sky-400" : "bg-teal-400"
            }`}
          />
          {i}
        </li>
      ))}
    </ul>
  </div>
);

const StatusPill = ({ h }: { h: Health }) => {
  const map = {
    ok: { Icon: CheckCircle2, color: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30", text: "OPERATIONAL" },
    warn: { Icon: AlertTriangle, color: "text-amber-300 bg-amber-400/10 border-amber-400/30", text: "DEGRADED" },
    down: { Icon: XCircle, color: "text-red-300 bg-red-500/10 border-red-500/30", text: "DOWN" },
  } as const;
  const cfg = map[h];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono ${cfg.color}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.text}
    </span>
  );
};

export default Dashboard;