"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function LoadingIndicator({ modelName = "Gemini 2.5 Flash" }) {
  return (
    <div className="flex items-start gap-4 py-4 px-2 max-w-3xl mx-auto w-full animate-fadeIn">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-secondary to-accent-primary flex items-center justify-center text-white shrink-0 shadow-sm">
        <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
      </div>

      <div className="flex-1 space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">Gemini AI</span>
          <span className="text-[10px] font-mono text-text-muted">{modelName}</span>
        </div>

        {/* Pulsing indicator dots */}
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="text-xs text-text-muted ml-2 font-mono">Thinking...</span>
        </div>
      </div>
    </div>
  );
}

