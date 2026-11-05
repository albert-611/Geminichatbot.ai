"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { Info, X, ShieldCheck, Key, Server } from "lucide-react";

const STORAGE_KEY = "gemini_ai_conversations_v1";
const ACTIVE_CONV_KEY = "gemini_ai_active_id_v1";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ apiConfigured: false });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Initialize conversations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_CONV_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          if (storedActiveId && parsed.some((c) => c.id === storedActiveId)) {
            setActiveId(storedActiveId);
          } else {
            setActiveId(parsed[0].id);
          }
          return;
        }
      }

      // Default first conversation if none found
      const initialId = Date.now().toString();
      const initialConv = {
        id: initialId,
        title: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setConversations([initialConv]);
      setActiveId(initialId);
    } catch (err) {
      console.error("Failed to load local conversations:", err);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch (err) {
        console.error("Failed to save conversations:", err);
      }
    }
  }, [conversations]);

  // Save activeId
  useEffect(() => {
    if (activeId) {
      try {
        localStorage.setItem(ACTIVE_CONV_KEY, activeId);
      } catch (err) {
        console.error("Failed to save active id:", err);
      }
    }
  }, [activeId]);

  // Check backend health and API status
  const checkHealth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      } else {
        setApiStatus({ apiConfigured: false, error: "Backend responded with error" });
      }
    } catch (err) {
      setApiStatus({ apiConfigured: false, error: "Backend is currently unreachable" });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0];

  // Helper to create a new chat
  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newId);
    setInput("");
    setSidebarOpen(false);
  };

  // Select conversation
  const handleSelectConversation = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  // Delete a conversation
  const handleDeleteConversation = (id) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const freshId = Date.now().toString();
        const freshConv = {
          id: freshId,
          title: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
        };
        setActiveId(freshId);
        return [freshConv];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename a conversation
  const handleRenameConversation = (id, newTitle) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Clear all chats
  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all conversation history?")) {
      const freshId = Date.now().toString();
      const freshConv = {
        id: freshId,
        title: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setConversations([freshConv]);
      setActiveId(freshId);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Clear current active conversation messages
  const handleClearChat = () => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [] } : c))
    );
  };

  // Generate automated title based on first user prompt
  const generateTitle = (text) => {
    const cleaned = text.trim().replace(/^[^a-zA-Z0-9]+/, "");
    if (cleaned.length <= 28) return cleaned || "New Chat";
    return cleaned.slice(0, 28) + "...";
  };

  // Send message with Server-Sent Events progressive streaming
  const handleSendMessage = async (customPrompt) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    const userMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: promptToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    // Prepare assistant placeholder message for immediate streaming updates
    const assistantPlaceholderId = "bot-" + Date.now();
    const assistantPlaceholder = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      model: selectedModel,
      isStreaming: true,
      timestamp: new Date().toISOString(),
    };

    const isFirstMessage = (activeConversation?.messages || []).length === 0;
    const newTitle = isFirstMessage ? generateTitle(promptToSend) : activeConversation.title;

    // Immediately push user message and streaming assistant placeholder
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: newTitle,
              messages: [...c.messages, userMessage, assistantPlaceholder],
            }
          : c
      )
    );

    setInput("");
    setIsLoading(true);

    try {
      // Map history for backend: cap at recent turns to keep context lightweight & fast
      const historyPayload = (activeConversation?.messages || [])
        .filter((m) => !m.isError && m.content)
        .slice(-12)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: promptToSend.trim(),
          history: historyPayload,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedReply = "";
      let resolvedModel = selectedModel;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "message";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.replace(/^event:\s*/, "");
            continue;
          }

          if (trimmed.startsWith("data:")) {
            const rawData = trimmed.replace(/^data:\s*/, "");
            try {
              const data = JSON.parse(rawData);

              if (currentEvent === "start") {
                if (data.model) resolvedModel = data.model;
              } else if (currentEvent === "chunk") {
                if (data.text) {
                  accumulatedReply += data.text;

                  // Update assistant message progressively
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeId
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantPlaceholderId
                                ? {
                                    ...m,
                                    content: accumulatedReply,
                                    model: resolvedModel,
                                    isStreaming: true,
                                  }
                                : m
                            ),
                          }
                        : c
                    )
                  );
                }
              } else if (currentEvent === "done") {
                if (data.model) resolvedModel = data.model;
              } else if (currentEvent === "error") {
                throw new Error(data.message || "Streaming error from Gemini");
              }
            } catch (jsonErr) {
              if (currentEvent === "error") throw jsonErr;
            }
          }
        }
      }

      // Mark stream as complete
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: accumulatedReply || "No content generated.",
                        model: resolvedModel,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Chat Streaming Error:", err);
      // Mark assistant placeholder as error
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: err.message || "Failed to generate AI response.",
                        isError: true,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last message
  const handleRetry = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;

    // Find the last user message
    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      // Remove any trailing failed or bot responses after this user message
      const lastUserIndex = activeConversation.messages.lastIndexOf(lastUserMessage);
      const trimmedMessages = activeConversation.messages.slice(0, lastUserIndex);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, messages: trimmedMessages } : c
        )
      );

      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-main text-text-primary antialiased">
      {/* Sidebar Component */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        apiStatus={apiStatus}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Chat Area */}
      <ChatWindow
        conversation={activeConversation}
        messages={activeConversation?.messages || []}
        input={input}
        setInput={setInput}
        onSend={handleSendMessage}
        isLoading={isLoading}
        onRetry={handleRetry}
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Settings & Info Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-bg-sidebar border border-border-subtle rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-heading font-semibold text-base flex items-center gap-2">
                <Info className="w-4 h-4 text-accent-primary" />
                Settings & Architecture
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-input"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="p-3 rounded-lg bg-bg-card border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    <Server className="w-3.5 h-3.5 text-accent-primary" /> Backend Server
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">{BACKEND_URL}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    <Key className="w-3.5 h-3.5 text-accent-primary" /> Gemini API Status
                  </span>
                  <span className={apiStatus?.apiConfigured ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                    {apiStatus?.apiConfigured ? "Configured" : "Missing / Not set in backend .env"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">Active Model</span>
                  <span className="font-mono text-accent-primary">{selectedModel}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-bg-card border border-border-subtle flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Security: Your Google Gemini API key is securely isolated in the Express backend and is never exposed to the client.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg bg-bg-card hover:bg-bg-input border border-border-subtle text-text-primary text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

