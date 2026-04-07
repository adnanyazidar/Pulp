"use client";

import { useDailyFocusStore, DailyNote } from "@/store/daily-focus-store";
import { useSound } from "@/lib/hooks/use-sound";
import {
  Plus,
  Check,
  ChevronDown,
  Sparkles,
  ListChecks,
  Trash2,
  RotateCcw,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TOOLTIPS } from "@/constants/copy";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Single Note Item ───
function DailyNoteItem({ note }: { note: DailyNote }) {
  const { toggleNote, deleteNote } = useDailyFocusStore();
  const { playSound } = useSound();

  const handleToggle = () => {
    toggleNote(note.id);
    if (!note.isCompleted) {
      playSound("click-soft");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group/note flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all duration-200 relative"
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer",
          note.isCompleted
            ? "bg-pf-primary border-pf-primary scale-90"
            : "border-pf-on-surface-variant/20 hover:border-pf-primary/60"
        )}
      >
        <Check
          className={cn(
            "w-3 h-3 transition-all",
            note.isCompleted
              ? "text-pf-on-primary opacity-100"
              : "text-transparent"
          )}
          strokeWidth={3}
        />
      </button>

      {/* Note Content */}
      <p
        className={cn(
          "flex-1 min-w-0 text-sm font-medium truncate transition-all cursor-default",
          note.isCompleted
            ? "line-through text-pf-on-surface-variant/30"
            : "text-pf-on-surface"
        )}
      >
        {note.content}
      </p>

      {/* Delete Button (visible on hover) */}
      <button
        onClick={() => deleteNote(note.id)}
        className="opacity-0 group-hover/note:opacity-100 p-1.5 rounded-lg text-pf-on-surface-variant/30 hover:text-pf-primary hover:bg-pf-primary/10 transition-all cursor-pointer shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}

// ─── Main Widget ───
export function DailyFocusWidget() {
  const { notes, addNote, clearCompleted } = useDailyFocusStore();
  const [inputValue, setInputValue] = useState("");
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const activeNotes = notes.filter((n) => !n.isCompleted);
  const completedNotes = notes.filter((n) => n.isCompleted);

  // Keyboard shortcut: "N" to focus input
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.key === "n" &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "TEXTAREA" &&
      document.activeElement?.tagName !== "SELECT"
    ) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addNote(inputValue.trim());
    setInputValue("");
  };

  if (!hasHydrated) {
    return (
      <div className="glass border border-white/10 rounded-2xl flex items-center justify-center h-full">
        <span className="text-pf-on-surface-variant/30 text-xs font-label uppercase tracking-widest">
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div className="glass border border-white/10 rounded-2xl flex flex-col overflow-hidden h-full">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <ListChecks size={16} className="text-pf-primary transition-theme" />
          <span className="font-label uppercase tracking-[0.25em] text-[10px] text-pf-primary font-bold transition-theme">
            Daily Focus
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-0.5 text-pf-primary/30 hover:text-pf-primary transition-colors cursor-help">
                  <Info size={12} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {TOOLTIPS.dailyFocus}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          {completedNotes.length > 0 && (
            <button
              onClick={clearCompleted}
              className="flex items-center gap-1 text-[9px] font-label text-pf-on-surface-variant/30 hover:text-pf-primary uppercase tracking-widest transition-all cursor-pointer px-2 py-1 rounded-lg hover:bg-pf-primary/10"
              title="Clear completed notes"
            >
              <RotateCcw size={10} />
              <span>Clear</span>
            </button>
          )}
          <span className="text-[10px] font-label text-pf-on-surface-variant/40 uppercase tracking-widest">
            {activeNotes.length} left
          </span>
        </div>
      </div>

      {/* ─── Quick Add Input ─── */}
      <form onSubmit={handleQuickAdd} className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-pf-surface-container-low/60 border border-white/5 rounded-xl px-3 py-2 focus-within:border-pf-primary/30 transition-all group/input">
          <Plus
            size={14}
            className="text-pf-on-surface-variant/30 group-focus-within/input:text-pf-primary transition-colors shrink-0"
          />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What's your focus today?"
            className="flex-1 bg-transparent border-none text-sm text-pf-on-surface placeholder:text-pf-on-surface-variant/25 focus:outline-none font-medium"
          />
          {inputValue.trim() && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              type="submit"
              className="p-1 rounded-lg bg-pf-primary/20 text-pf-primary hover:bg-pf-primary/30 transition-all"
            >
              <Sparkles size={12} />
            </motion.button>
          )}
        </div>
      </form>

      {/* ─── Notes List (Scrollable) ─── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        {activeNotes.length === 0 && completedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ListChecks size={32} className="text-pf-primary/10 mb-3" />
            <p className="text-xs text-pf-on-surface-variant/30 font-label uppercase tracking-widest">
              No notes yet
            </p>
            <p className="text-[10px] text-pf-on-surface-variant/20 mt-1">
              Your private scratchpad — local only
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeNotes.map((note) => (
              <DailyNoteItem key={note.id} note={note} />
            ))}
          </AnimatePresence>
        )}

        {/* ─── Completed Section ─── */}
        {completedNotes.length > 0 && (
          <div className="mt-2 border-t border-white/5 pt-2">
            <button
              onClick={() => setIsCompletedOpen(!isCompletedOpen)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-white/[0.02] rounded-lg transition-all cursor-pointer"
            >
              <motion.div
                animate={{ rotate: isCompletedOpen ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  size={12}
                  className="text-pf-on-surface-variant/30"
                />
              </motion.div>
              <span className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/30 font-bold">
                Done Today
              </span>
              <span className="text-[10px] font-label text-pf-on-surface-variant/20 ml-auto">
                {completedNotes.length}
              </span>
            </button>

            <AnimatePresence>
              {isCompletedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="opacity-40 space-y-0.5">
                    {completedNotes.map((note) => (
                      <DailyNoteItem key={note.id} note={note} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
