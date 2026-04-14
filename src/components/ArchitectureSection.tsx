import { useState } from "react";
import { modules, type ModuleInfo } from "@/lib/moduleData";
import ModuleDetailModal from "./ModuleDetailModal";

const ArchitectureSection = () => {
  const [mode, setMode] = useState<"legacy" | "modular">("modular");
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);

  const isLegacy = mode === "legacy";

  // Module positions for the diagram
  const positions = [
    { x: 50, y: 20 },  // Accounts - top center
    { x: 15, y: 50 },  // Payments - left
    { x: 85, y: 50 },  // Fraud - right
    { x: 25, y: 82 },  // Notifications - bottom left
    { x: 75, y: 82 },  // Profile - bottom right
  ];

  // Legacy connections: everything connects to everything (messy)
  const legacyConnections = [
    [0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4],
  ];

  // Modular connections: clean, intentional
  const modularConnections = [
    [0,1], // Accounts <-> Payments
    [1,2], // Payments <-> Fraud
    [1,3], // Payments <-> Notifications
    [2,3], // Fraud <-> Notifications
    [0,4], // Accounts <-> Profile
  ];

  const connections = isLegacy ? legacyConnections : modularConnections;

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">System Architecture</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Toggle between legacy and modular views to see the architectural difference.
          </p>

          {/* Mode Toggle */}
          <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-1">
            <button
              onClick={() => setMode("legacy")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                isLegacy
                  ? "bg-legacy text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Legacy Mode
            </button>
            <button
              onClick={() => setMode("modular")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                !isLegacy
                  ? "bg-modular text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Modular Mode
            </button>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className={`relative rounded-xl border bg-card p-8 min-h-[500px] transition-all duration-500 ${
          isLegacy ? "border-legacy/30" : "border-modular/30"
        }`}>
          {/* Status banner */}
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-medium ${
            isLegacy ? "bg-legacy/10 text-legacy" : "bg-modular/10 text-modular"
          }`}>
            {isLegacy ? "⚠ Tightly Coupled — High Risk" : "✓ Loosely Coupled — Low Risk"}
          </div>

          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {connections.map(([from, to], i) => {
              const x1 = `${positions[from].x}%`;
              const y1 = `${positions[from].y}%`;
              const x2 = `${positions[to].x}%`;
              const y2 = `${positions[to].y}%`;
              return (
                <line
                  key={`${from}-${to}-${mode}-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isLegacy ? "hsl(0 72% 55% / 0.3)" : "hsl(165 70% 46% / 0.2)"}
                  strokeWidth={isLegacy ? "2" : "1.5"}
                  strokeDasharray={isLegacy ? "none" : "6 4"}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Module Nodes */}
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2 p-4 rounded-xl border bg-card transition-all duration-300 hover:scale-105 cursor-pointer group ${
                isLegacy
                  ? "border-legacy/20 hover:border-legacy/50"
                  : "border-border hover:border-modular/50"
              }`}
              style={{
                left: `${positions[i].x}%`,
                top: `${positions[i].y}%`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: `hsl(${mod.color} / 0.15)` }}
              >
                <mod.icon className="w-5 h-5" style={{ color: `hsl(${mod.color})` }} />
              </div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{mod.name}</span>
              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Click for details
              </span>
            </button>
          ))}

          {/* Legacy overlay: tangled warning */}
          {isLegacy && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md bg-legacy/10 text-legacy text-xs">
              Updating any module risks breaking all connections
            </div>
          )}
        </div>
      </div>

      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </section>
  );
};

export default ArchitectureSection;
