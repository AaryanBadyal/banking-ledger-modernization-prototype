import { useState, useEffect } from "react";
import { Layers } from "lucide-react";

const navItems = [
  { id: "hero", label: "Overview" },
  { id: "comparison", label: "Comparison" },
  { id: "legacy-look", label: "Legacy Look" },
  { id: "architecture", label: "Architecture" },
  { id: "simulator", label: "Simulator" },
  { id: "why", label: "Why It Matters" },
];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 font-semibold text-foreground">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm">MBS</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
