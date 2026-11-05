"use client";

import React, { useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  Edit2,
  Check
} from "lucide-react";

export default function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
  apiStatus,
  isOpen,
  onToggleSidebar,
  onOpenSettings,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditing = (convId, e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (convId, e) => {
    if (e.key === "Enter") {
      saveEditing(convId, e);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity" 
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-bg-sidebar border-r border-border-subtle transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header: Logo and App Name */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-secondary to-accent-primary text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-sm tracking-tight text-text-primary flex items-center gap-1.5">
                Gemini AI
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-secondary/15 text-accent-primary font-medium">
                  3.5
                </span>
              </h1>
            </div>
          </div>
          
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-input md:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="flex items-center justify-center w-full gap-2 px-3 py-2.5 rounded-lg bg-bg-card hover:bg-bg-input border border-border-subtle text-text-primary text-sm font-medium transition-all duration-150 hover:border-accent-primary/40 group active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-accent-primary group-hover:scale-110 transition-transform" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Section: Recent Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            <span>Recent Chats</span>
            {conversations.length > 0 && (
              <button
                onClick={onClearAll}
                title="Clear all conversations"
                className="hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-text-muted">
              No recent chats yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? "bg-bg-card text-text-primary font-medium border border-border-subtle"
                      : "text-text-secondary hover:bg-bg-card/50 hover:text-text-primary"
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-accent-primary" : "text-text-muted group-hover:text-text-secondary"}`} />
                  
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(conv.id, e)}
                        autoFocus
                        className="w-full bg-bg-input px-1.5 py-0.5 rounded text-xs text-text-primary border border-accent-primary outline-none"
                      />
                      <button
                        onClick={(e) => saveEditing(conv.id, e)}
                        className="p-1 hover:text-green-400"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate flex-1 text-left">
                      {conv.title || "Untitled Conversation"}
                    </span>
                  )}

                  {/* Actions: Edit & Delete buttons visible on hover or active */}
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => startEditing(conv, e)}
                        className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-bg-input"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="p-1 text-text-muted hover:text-red-400 rounded hover:bg-bg-input"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area: API Status, Settings, Version */}
        <div className="p-3 border-t border-border-subtle space-y-2 text-xs">
          {/* Status Indicator */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-bg-card border border-border-subtle">
            <span className="text-text-muted flex items-center gap-1.5">
              API Status
            </span>
            <div className="flex items-center gap-1.5">
              {apiStatus?.apiConfigured ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-medium">Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-amber-400 font-medium">Check Key</span>
                </>
              )}
            </div>
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-input transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              Settings & Info
            </span>
            <span className="text-[10px] text-text-muted font-mono">v1.0.0</span>
          </button>
        </div>
      </aside>
    </>
  );
}

