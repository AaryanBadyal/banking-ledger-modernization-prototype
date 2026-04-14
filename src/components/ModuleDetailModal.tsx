import { X, ArrowDownLeft, ArrowUpRight, Link, Lightbulb } from "lucide-react";
import type { ModuleInfo } from "@/lib/moduleData";

interface ModuleDetailModalProps {
  module: ModuleInfo;
  onClose: () => void;
}

const ModuleDetailModal = ({ module, onClose }: ModuleDetailModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-8 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `hsl(${module.color} / 0.15)` }}
          >
            <module.icon className="w-6 h-6" style={{ color: `hsl(${module.color})` }} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{module.name}</h3>
            <p className="text-sm text-muted-foreground">{module.description}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Inputs
            </h4>
            <div className="flex flex-wrap gap-2">
              {module.inputs.map((input) => (
                <span key={input} className="px-2.5 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">{input}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Outputs
            </h4>
            <div className="flex flex-wrap gap-2">
              {module.outputs.map((output) => (
                <span key={output} className="px-2.5 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">{output}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5" /> Connects To
            </h4>
            <div className="flex flex-wrap gap-2">
              {module.connections.map((conn) => (
                <span key={conn} className="px-2.5 py-1 rounded-md border border-border text-xs text-foreground">{conn}</span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Why Isolate This Module?
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{module.whyIsolate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailModal;
