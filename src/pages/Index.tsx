import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import ComparisonSection from "@/components/ComparisonSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import WhyItMattersSection from "@/components/WhyItMattersSection";

const Index = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExplore = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection onExplore={handleExplore} />
      <div ref={contentRef}>
        <ComparisonSection />
      </div>
      <ArchitectureSection />
      <ScenarioSimulator />
      <WhyItMattersSection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Modular Banking System — A concept prototype demonstrating modular system design for banking modernization.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This is a design prototype, not a production banking application.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
