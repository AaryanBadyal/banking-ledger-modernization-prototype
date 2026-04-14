import { AlertTriangle, Database, Server, Lock, Layers } from "lucide-react";

const LegacyLookSection = () => {
  return (
    <section id="legacy-look" className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Legacy Software Looks Today</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most bank systems were built decades ago as a single, tightly connected codebase. Here's what that looks like under the hood.
          </p>
        </div>

        {/* Legacy monolith visual */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border-2 border-legacy/30 bg-background p-8 relative glow-legacy">
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-legacy/10 text-legacy text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Monolithic System
            </div>

            {/* Big monolith block */}
            <div className="mt-10 border-2 border-dashed border-legacy/20 rounded-xl p-6">
              <div className="text-center mb-6">
                <Server className="w-8 h-8 text-legacy mx-auto mb-2" />
                <span className="text-sm font-semibold text-foreground">CORE_BANKING_v3.2.exe</span>
                <p className="text-xs text-muted-foreground mt-1">Single deployment unit — 2.4M lines of code</p>
              </div>

              {/* Internal tangled modules */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Accounts", lines: "340K LOC" },
                  { name: "Payments", lines: "520K LOC" },
                  { name: "Fraud Rules", lines: "180K LOC" },
                  { name: "Notifications", lines: "90K LOC" },
                  { name: "Auth / KYC", lines: "210K LOC" },
                  { name: "Reporting", lines: "160K LOC" },
                  { name: "Audit Logs", lines: "130K LOC" },
                  { name: "Config / Utils", lines: "770K LOC" },
                ].map((mod) => (
                  <div key={mod.name} className="border border-legacy/15 rounded-lg p-3 bg-card text-center">
                    <span className="text-xs font-medium text-foreground block">{mod.name}</span>
                    <span className="text-[10px] text-muted-foreground">{mod.lines}</span>
                  </div>
                ))}
              </div>

              {/* Tangled connections SVG overlay */}
              <svg className="w-full h-16 mt-4" viewBox="0 0 400 50">
                {[
                  "M20,10 C80,45 120,5 200,40",
                  "M50,5 C150,50 250,10 380,35",
                  "M100,40 C180,5 220,50 300,10",
                  "M30,30 C130,0 270,50 370,15",
                  "M150,8 C200,45 280,5 350,42",
                  "M10,25 C100,50 300,0 390,30",
                ].map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="hsl(0 72% 50% / 0.2)" strokeWidth="1.5" />
                ))}
              </svg>
              <p className="text-xs text-muted-foreground text-center mt-1 italic">
                Spaghetti dependencies — every module touches every other module
              </p>
            </div>

            {/* Problems list */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Lock, title: "Vendor Lock-in", desc: "Built on proprietary tech from the 1990s. Can't swap components." },
                { icon: Database, title: "Shared Database", desc: "All modules read/write the same tables. Schema changes break everything." },
                { icon: Layers, title: "Deploy Everything", desc: "Changing one line of code requires redeploying the entire system." },
              ].map((p) => (
                <div key={p.title} className="p-4 rounded-lg bg-legacy/5 border border-legacy/10">
                  <p.icon className="w-4 h-4 text-legacy mb-2" />
                  <h4 className="text-sm font-semibold mb-1">{p.title}</h4>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegacyLookSection;
