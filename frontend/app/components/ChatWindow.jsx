"use client";

import React, { useRef, useEffect } from "react";
import { 
  Menu, 
  Plus, 
  Trash2, 
  Sparkles, 
  Cpu, 
  ChevronDown 
} from "lucide-react";
import WelcomeScreen from "./WelcomeScreen";
import ChatMessage from "./ChatMessage";
import LoadingIndicator from "./LoadingIndicator";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  conversation,
  messages,
  input,
  setInput,
  onSend,
  isLoading,
  onRetry,
  onNewChat,
  onClearChat,
  selectedModel,
  setSelectedModel,
  onToggleSidebar,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const models = [
    { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite", badge: "Ultra Fast" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "Smart & Fast" },
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", badge: "Latest Flash" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-chat relative min-w-0 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border-subtle px-4 flex items-center justify-between bg-bg-chat/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-input md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model Selector Dropdown */}
          <div className="relative group">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-bg-card hover:bg-bg-input border border-border-subtle hover:border-accent-primary/40 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-text-primary outline-none transition-colors cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-bg-card text-text-primary">
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Current Chat Title */}
          <div className="hidden sm:flex items-center gap-1.5 max-w-[200px] md:max-w-xs truncate text-xs text-text-muted font-medium">
            <span className="truncate">
              {conversation?.title || "New Chat"}
            </span>
          </div>
        </div>

        {/* Action icons on top right */}
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-input border border-transparent hover:border-border-subtle transition-colors"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5 text-accent-primary" />
            <span className="hidden sm:inline">New</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-bg-input transition-colors"
              title="Clear current conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Messages Area */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={(prompt) => onSend(prompt)} />
        ) : (
          <div className="max-w-3xl mx-auto w-full divide-y divide-border-subtle/40">
            {messages.map((msg, index) => {
              const isLastAi =
                msg.role === "assistant" &&
                index === messages.findLastIndex?.((m) => m.role === "assistant");

              return (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  isLastAiMessage={isLastAi}
                  onRetry={onRetry}
                  isLoading={isLoading}
                />
              );
            })}

            {/* Loading indicator when waiting for Gemini API response before first chunk */}
            {isLoading && !messages.some((m) => m.isStreaming) && (
              <LoadingIndicator
                modelName={
                  models.find((m) => m.id === selectedModel)?.name || "Gemini AI"
                }
              />
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Message Composer */}
      <footer className="shrink-0 bg-gradient-to-t from-bg-chat via-bg-chat/90 to-transparent pt-2">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => onSend()}
          isLoading={isLoading}
          disabled={false}
        />
      </footer>
    </div>
  );
}

