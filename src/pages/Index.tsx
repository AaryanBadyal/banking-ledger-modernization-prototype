import { useRef } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import ComparisonSection from "@/components/ComparisonSection";
import LegacyLookSection from "@/components/LegacyLookSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import WhyItMattersSection from "@/components/WhyItMattersSection";

const Index = () => {
  const handleExplore = () => {
    document.getElementById("comparison")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div id="hero">
        <HeroSection onExplore={handleExplore} />
      </div>
      <div id="comparison">
        <ComparisonSection />
      </div>
      <LegacyLookSection />
      <div id="architecture">
        <ArchitectureSection />
      </div>
      <ScenarioSimulator />
      <div id="why">
        <WhyItMattersSection />
      </div>

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
