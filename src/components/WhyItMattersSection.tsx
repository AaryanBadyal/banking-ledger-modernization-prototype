import { ShieldCheck, Wrench, Rocket, Bug, TrendingUp, Lightbulb } from "lucide-react";

const benefits = [
  { icon: ShieldCheck, title: "Lower Update Risk", desc: "Changes are scoped to individual modules. No more system-wide outages from a single update." },
  { icon: Wrench, title: "Easier Maintenance", desc: "Teams own specific modules. Debugging is faster because boundaries are clear." },
  { icon: Rocket, title: "Faster Innovation", desc: "New features ship independently. No waiting for monolith release cycles." },
  { icon: Bug, title: "Clearer Debugging", desc: "Issues are isolated to module boundaries. Stack traces point to one service, not the entire system." },
  { icon: TrendingUp, title: "Gradual Modernization", desc: "Replace legacy components one at a time. No risky big-bang migrations." },
  { icon: Lightbulb, title: "Future-Ready", desc: "New technologies can be adopted per module without rewriting the entire platform." },
];

const WhyItMattersSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why This Matters</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Modular design isn't just a technical preference — it's a strategic advantage for banking modernization.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Core idea callout */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center max-w-3xl mx-auto">
          <p className="text-lg text-foreground leading-relaxed mb-4">
            "This project reimagines banking software using modular design. Instead of replacing an entire legacy system at once, banks could gradually modernize one module at a time. This reduces risk and makes updates easier."
          </p>
          <p className="text-sm text-muted-foreground">
            Inspired by modular design thinking from modern software architecture and node-based systems.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
