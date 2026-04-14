import { AlertTriangle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const comparisons = [
  { aspect: "Architecture", legacy: "Monolithic, tightly coupled", modular: "Independent, loosely coupled modules" },
  { aspect: "Update Risk", legacy: "High — changes cascade across the system", modular: "Low — isolated changes per module" },
  { aspect: "Maintenance", legacy: "Complex — requires full system knowledge", modular: "Simple — team owns one module" },
  { aspect: "Innovation Speed", legacy: "Slow — fear of breaking dependencies", modular: "Fast — iterate independently" },
  { aspect: "Debugging", legacy: "Difficult — tangled dependencies", modular: "Clear — scoped to module boundaries" },
  { aspect: "Modernization", legacy: "Full rewrite required", modular: "Gradual, module-by-module upgrade" },
];

const ComparisonSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Legacy vs Modular</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A side-by-side look at why modular design transforms banking infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Legacy Card */}
          <div className="rounded-xl border border-legacy/30 bg-card p-8 glow-legacy">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-legacy/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-legacy" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Legacy System</h3>
                <p className="text-sm text-muted-foreground">Monolithic Architecture</p>
              </div>
            </div>
            <div className="space-y-3">
              {["Tightly connected components", "Single point of failure", "Updates risk system-wide outages", "Slow release cycles", "Difficult to onboard new developers"].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-legacy mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modular Card */}
          <div className="rounded-xl border border-modular/30 bg-card p-8 glow-accent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-modular/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-modular" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Modular System</h3>
                <p className="text-sm text-muted-foreground">Independent Modules</p>
              </div>
            </div>
            <div className="space-y-3">
              {["Independent, self-contained modules", "Fault isolation per module", "Safe, scoped updates", "Rapid iteration per team", "Clear ownership and documentation"].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-modular mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 bg-secondary/50 px-6 py-4 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aspect</span>
            <span className="text-sm font-semibold text-legacy uppercase tracking-wider">Legacy</span>
            <span className="text-sm font-semibold text-modular uppercase tracking-wider">Modular</span>
          </div>
          {comparisons.map((row, i) => (
            <div key={row.aspect} className={`grid grid-cols-3 px-6 py-4 ${i < comparisons.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-sm font-medium text-foreground">{row.aspect}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-legacy flex-shrink-0" />
                {row.legacy}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-modular flex-shrink-0" />
                {row.modular}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
