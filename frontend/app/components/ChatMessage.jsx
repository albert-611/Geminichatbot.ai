"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  RotateCw, 
  AlertTriangle 
} from "lucide-react";

export default function ChatMessage({
  message,
  onRetry,
  isLastAiMessage,
  isLoading
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  const copyToClipboard = (text, index = null) => {
    navigator.clipboard.writeText(text);
    if (index !== null) {
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Custom code renderer with copy button
  let codeBlockCounter = 0;

  return (
    <div
      className={`py-4 px-2 sm:px-4 transition-colors animate-fadeIn ${
        isUser ? "flex justify-end" : "flex justify-start"
      }`}
    >
      <div
        className={`flex gap-3 sm:gap-4 max-w-3xl w-full ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-border-subtle flex items-center justify-center text-text-secondary border border-border-highlight">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-secondary to-accent-primary flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div
          className={`flex-1 min-w-0 ${
            isUser
              ? "max-w-[85%] sm:max-w-[78%] flex flex-col items-end"
              : "w-full"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center gap-2 mb-1.5 ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <span className="text-xs font-semibold text-text-primary">
              {isUser ? "You" : "Gemini AI"}
            </span>
            {message.model && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-card border border-border-subtle text-accent-primary">
                {message.model}
              </span>
            )}
            {message.isStreaming && (
              <span className="flex items-center gap-1 text-[11px] text-accent-primary font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-ping" />
                Streaming...
              </span>
            )}
            {message.timestamp && (
              <span className="text-[10px] text-text-muted">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            {message.isError && (
              <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                <AlertTriangle className="w-3 h-3" />
                Error
              </span>
            )}
          </div>

          {/* Body */}
          {isUser ? (
            <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-bg-card border border-border-subtle text-text-primary text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
              {message.content}
            </div>
          ) : (
            <div className="text-text-primary text-sm leading-relaxed w-full">
              {message.isError ? (
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 my-1">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-300 mb-1">Response Failed</p>
                    <p className="text-red-300/80">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-text-primary text-sm space-y-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p({ children }) {
                        return <p className="mb-2 leading-relaxed text-text-primary text-[14px]">{children}</p>;
                      },
                      h1({ children }) {
                        return <h1 className="text-lg font-bold text-text-primary mt-4 mb-2 font-heading">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-base font-semibold text-text-primary mt-3 mb-1.5 font-heading">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-sm font-semibold text-text-primary mt-2.5 mb-1 font-heading">{children}</h3>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 my-2 space-y-1 text-text-secondary">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 my-2 space-y-1 text-text-secondary">{children}</ol>;
                      },
                      li({ children }) {
                        return <li className="text-[14px] text-text-primary leading-normal">{children}</li>;
                      },
                      strong({ children }) {
                        return <strong className="font-semibold text-text-primary">{children}</strong>;
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-2 border-accent-primary/60 pl-3.5 my-2 italic text-text-secondary text-xs">
                            {children}
                          </blockquote>
                        );
                      },
                      code({ node, inline, className, children, ...props }) {
                        const codeString = String(children).replace(/\n$/, "");
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";

                        if (inline) {
                          return (
                            <code
                              className="px-1.5 py-0.5 rounded bg-bg-input text-accent-primary font-mono text-[12px] border border-border-subtle"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        const currentCodeIdx = ++codeBlockCounter;
                        const isCopied = copiedCodeIndex === currentCodeIdx;

                        return (
                          <div className="relative my-3 rounded-lg overflow-hidden border border-border-subtle bg-bg-sidebar">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-bg-card/70 border-b border-border-subtle text-[11px] font-mono text-text-muted">
                              <span>{language || "code"}</span>
                              <button
                                onClick={() => copyToClipboard(codeString, currentCodeIdx)}
                                className="flex items-center gap-1 hover:text-text-primary transition-colors py-0.5 px-1.5 rounded hover:bg-bg-input"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-text-primary leading-relaxed bg-[#0e1117]">
                              <code>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Action Buttons for AI Responses */}
              {!message.isError && !message.isStreaming && (
                <div className="flex items-center gap-2 mt-3 pt-1 text-xs text-text-muted">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-bg-card hover:text-text-primary transition-colors text-[11px]"
                    title="Copy full response"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {isLastAiMessage && onRetry && (
                    <button
                      onClick={onRetry}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-bg-card hover:text-text-primary transition-colors text-[11px] disabled:opacity-50"
                      title="Retry response"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

