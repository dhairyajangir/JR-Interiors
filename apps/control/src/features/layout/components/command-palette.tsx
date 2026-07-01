"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCurrentUser, useAuth } from "../../auth/hooks";
import { useKeyboardShortcut, commandRegistry, searchRegistry, SearchResult } from "@jr/command";
import { can } from "@jr/auth";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, Command, Sparkles } from "lucide-react";

export function CommandPalette() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Listen for global hotkeys: Ctrl+K / Cmd+K
  useKeyboardShortcut(["ctrl", "k"], () => {
    setIsOpen((prev) => !prev);
  });

  // 2. Listen for '/' key to open and focus palette
  useKeyboardShortcut(["/"], () => {
    setIsOpen(true);
  });

  // 3. Listen for 'Esc' key to close palette
  useKeyboardShortcut(["Escape"], () => {
    setIsOpen(false);
  }, !isOpen);

  // Listen for programmatic open trigger events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Manage focus restoration and inputs reset
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      if (previousFocusRef.current) {
        const el = previousFocusRef.current;
        setTimeout(() => el.focus(), 50);
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // 4. Perform Search
  useEffect(() => {
    if (!isOpen || !user) return;

    let active = true;

    async function fetchResults() {
      // Setup Command Execution Context
      const context = {
        router: {
          push: (href: string) => {
            router.push(href);
            setIsOpen(false);
          },
          refresh: () => router.refresh(),
        },
        logout,
        user,
      };

      if (!query.trim()) {
        // Show all available commands in permission matrix
        const allCommands = commandRegistry.getCommands()
          .filter((cmd) => !cmd.permission || can(user, cmd.permission))
          .map((cmd) => ({
            id: cmd.id,
            title: cmd.title,
            description: cmd.description || cmd.category,
            category: cmd.category,
            action: () => {
              cmd.action(context);
              setIsOpen(false);
            },
          }));

        if (active) {
          setResults(allCommands);
          setSelectedIndex(0);
        }
        return;
      }

      // Query extensible search registry providers
      const searchResults = await searchRegistry.search(query, user);
      
      if (active) {
        // Map raw provider actions to close the palette automatically
        const mapped = searchResults.map((r) => ({
          ...r,
          action: () => {
            if (r.action) {
              r.action();
            } else if (r.href) {
              router.push(r.href);
            }
            setIsOpen(false);
          },
        }));
        setResults(mapped);
        setSelectedIndex(0);
      }
    }

    fetchResults();

    return () => {
      active = false;
    };
  }, [query, isOpen, user, router, logout]);

  // 5. Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action?.();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Keep focus locked in the text search input
      inputRef.current?.focus();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group search results by category
  const categories = Array.from(new Set(results.map((r) => r.category)));

  // Flatten the grouped layout so we can easily map index positions
  const renderList: React.ReactNode[] = [];
  let flatIdxCounter = 0;

  categories.forEach((cat) => {
    const catItems = results.filter((r) => r.category === cat);
    if (catItems.length === 0) return;

    // Add category header
    renderList.push(
      <div
        key={`cat-${cat}`}
        className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-secondary/60 bg-sidebar border-b border-muted/30 select-none first:rounded-t-md"
      >
        {cat}
      </div>
    );

    // Add items
    catItems.forEach((item) => {
      const currentIdx = flatIdxCounter++;
      const isSelected = currentIdx === selectedIndex;

      renderList.push(
        <button
          key={item.id}
          onClick={() => item.action?.()}
          onMouseEnter={() => setSelectedIndex(currentIdx)}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-all duration-75 cursor-pointer focus:outline-none ${
            isSelected
              ? "bg-bronze/10 text-bronze border-l-2 border-bronze font-medium"
              : "text-primary border-l-2 border-transparent hover:bg-base/30"
          }`}
        >
          <div className="flex flex-col min-w-0 pr-4">
            <span className="truncate">{item.title}</span>
            {item.description && item.description !== item.title && (
              <span className="text-[10px] text-secondary font-light truncate mt-0.5">
                {item.description}
              </span>
            )}
          </div>
          {isSelected && (
            <div className="flex items-center space-x-1 text-bronze text-[9px] shrink-0 font-mono select-none">
              <span>Execute</span>
              <CornerDownLeft className="h-3 w-3 shrink-0" />
            </div>
          )}
        </button>
      );
    });
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Container */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="relative bg-panel border border-muted w-full max-w-lg rounded-md luxury-shadow-md overflow-hidden z-50 animate-fade-in flex flex-col focus:outline-none"
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="flex items-center space-x-2.5 px-4 py-3 border-b border-muted">
          <Search className="h-4 w-4 text-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-primary placeholder-secondary/70 focus:outline-none"
            aria-label="Spotlight query"
          />
          <div className="flex items-center space-x-1 border border-muted bg-base px-1.5 py-0.5 rounded text-[9px] text-secondary shrink-0 font-mono select-none">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Results Stream */}
        <div
          ref={listRef}
          role="listbox"
          className="max-h-[340px] overflow-y-auto divide-y divide-muted/30 focus:outline-none"
        >
          {results.length > 0 ? (
            renderList
          ) : (
            <div className="p-8 text-center text-secondary text-xs flex flex-col items-center justify-center space-y-2 select-none">
              <Sparkles className="h-5 w-5 text-bronze/40" />
              <p className="font-light">No commands or routes match your query.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-muted bg-sidebar text-[10px] text-secondary flex items-center justify-between select-none">
          <span className="font-light">
            Use <kbd className="px-1 py-0.5 border border-muted bg-panel rounded font-mono">↑</kbd> <kbd className="px-1 py-0.5 border border-muted bg-panel rounded font-mono">↓</kbd> to navigate, <kbd className="px-1 py-0.5 border border-muted bg-panel rounded font-mono">Enter</kbd> to run.
          </span>
          <span className="font-light">
            Press <kbd className="px-1 py-0.5 border border-muted bg-panel rounded font-mono">Esc</kbd> to close.
          </span>
        </div>
      </div>
    </div>
  );
}
