"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, CornerDownLeft, Sparkles } from "lucide-react";

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  disabled
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  const charCount = input.length;
  const maxChars = 4000;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Input container */}
      <div className="relative rounded-2xl bg-bg-input border border-border-subtle focus-within:border-accent-primary/50 transition-all duration-200 shadow-lg shadow-black/20">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything... (Press Enter to send, Shift + Enter for new line)"
          rows={1}
          disabled={isLoading || disabled}
          className="w-full px-4 pt-3.5 pb-10 bg-transparent text-text-primary placeholder:text-text-muted text-sm resize-none outline-none font-sans max-h-48 leading-relaxed disabled:opacity-50"
        />

        {/* Bottom controls bar inside the input box */}
        <div className="absolute bottom-2.5 left-4 right-3 flex items-center justify-between pointer-events-none">
          {/* Character counter & hints */}
          <div className="flex items-center gap-2 pointer-events-auto text-[11px] text-text-muted font-mono">
            <span className={isOverLimit ? "text-red-400 font-semibold" : ""}>
              {charCount} / {maxChars}
            </span>
            <span className="hidden sm:inline text-text-muted/60">• Enter to send</span>
          </div>

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading || isOverLimit || disabled}
            className={`pointer-events-auto flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 ${
              input.trim() && !isLoading && !isOverLimit && !disabled
                ? "bg-gradient-to-tr from-accent-secondary to-accent-primary text-white hover:opacity-90 active:scale-95 shadow-md shadow-accent-primary/25"
                : "bg-border-subtle text-text-muted cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Security and Accuracy Disclaimer */}
      <p className="text-center text-[11px] text-text-muted mt-2 tracking-tight">
        Gemini AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}

