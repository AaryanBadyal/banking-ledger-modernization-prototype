import { ArrowDown, Layers, Shield } from "lucide-react";

interface HeroSectionProps {
  onExplore: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-mesh overflow-hidden pt-14">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 mb-8 animate-fade-up">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">System Design Concept</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-foreground">Modular</span>
          <br />
          <span className="text-gradient">Banking System</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Banks still rely on legacy software that is slow and risky to update.
        </p>
        <p className="text-base md:text-lg text-secondary-foreground max-w-2xl mx-auto mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          This prototype shows how modular system design can make banking software easier to modernize — one module at a time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all glow-primary"
          >
            <Shield className="w-5 h-5" />
            Explore the System
          </button>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-border bg-secondary text-secondary-foreground font-medium text-lg hover:bg-muted transition-all"
          >
            Compare Legacy vs Modular
          </button>
        </div>
        
        <div className="mt-20 animate-bounce">
          <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
