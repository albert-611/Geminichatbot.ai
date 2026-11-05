"use client";

import React from "react";
import { Terminal, Code2, Compass, Lightbulb, Sparkles } from "lucide-react";

export default function WelcomeScreen({ onSelectPrompt }) {
  const suggestions = [
    {
      id: 1,
      icon: Terminal,
      title: "Explain a programming concept",
      prompt: "Explain how React Server Components work and how they differ from standard client-side components.",
      category: "Concepts"
    },
    {
      id: 2,
      icon: Code2,
      title: "Help me write code",
      prompt: "Write a complete Express.js middleware function to implement token bucket rate limiting with Redis or in-memory map.",
      category: "Coding"
    },
    {
      id: 3,
      icon: Compass,
      title: "Learn something new",
      prompt: "What are the latest architectural breakthroughs in transformer attention mechanisms like FlashAttention and multi-query attention?",
      category: "Learning"
    },
    {
      id: 4,
      icon: Lightbulb,
      title: "Brainstorm creative ideas",
      prompt: "Brainstorm 5 innovative micro-SaaS application ideas that leverage Gemini 2.5 multimodal capabilities for productivity.",
      category: "Ideation"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 max-w-3xl mx-auto text-center animate-fadeIn">
      {/* Icon Badge */}
      <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-gradient-to-tr from-accent-secondary/20 to-accent-primary/20 border border-accent-primary/30 text-accent-primary shadow-lg shadow-accent-primary/5">
        <Sparkles className="w-7 h-7" />
      </div>

      {/* Main Headings */}
      <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary mb-3">
        How can I help you today?
      </h2>
      <p className="text-sm sm:text-base text-text-secondary max-w-md mb-10 leading-relaxed">
        Ask anything. Explore ideas, solve problems, and build something great.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex flex-col justify-between p-4 rounded-xl bg-bg-card hover:bg-bg-input border border-border-subtle hover:border-accent-primary/40 transition-all duration-200 text-left active:scale-[0.99] shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-bg-input group-hover:bg-accent-primary/10 border border-border-subtle text-accent-primary transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors flex items-center gap-1.5">
                    {item.title}
                  </div>
                  <p className="text-[12px] text-text-secondary line-clamp-2 mt-1 leading-snug">
                    {item.prompt}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

