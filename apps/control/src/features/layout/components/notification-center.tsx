"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, Shield, Settings, Info, Circle } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: "Security" | "System" | "Updates";
  read: boolean;
  time: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "New device login detected",
      body: "Your account logged in from Chrome on Windows (IP 192.168.1.45).",
      category: "Security",
      read: false,
      time: "2 mins ago",
    },
    {
      id: "2",
      title: "Database schema synchronized",
      body: "Prisma client successfully updated against relational PostgreSQL tables.",
      category: "System",
      read: false,
      time: "1 hour ago",
    },
    {
      id: "3",
      title: "Atelier OS v1.0.1 Released",
      body: "Command registry, keyboard shortcuts, and AppShell layout optimization are now live.",
      category: "Updates",
      read: true,
      time: "1 day ago",
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleArchive = (id: string) => {
    // Under real database, this deletes or archives.
    // For architecture mock, we delete from local list state and print.
    console.log(`[NotificationCenter] Archiving notification ${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "Security":
        return <Shield className="h-3.5 w-3.5 text-error" />;
      case "System":
        return <Settings className="h-3.5 w-3.5 text-bronze" />;
      default:
        return <Info className="h-3.5 w-3.5 text-gold" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-md text-secondary hover:text-primary hover:bg-base transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50"
        aria-label="Open notifications panel"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold border border-panel animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 rounded-md border border-muted bg-panel luxury-shadow-md py-1 z-50 animate-fade-in origin-top-right focus:outline-none"
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-muted flex items-center justify-between bg-sidebar/50">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold leading-none font-mono">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-bronze hover:text-bronze/80 font-medium cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-muted/30">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 text-xs transition-colors flex items-start space-x-3 ${
                    notif.read ? "bg-panel/40" : "bg-bronze/[0.02]"
                  }`}
                >
                  {/* Category Indicator Icon */}
                  <div className="mt-0.5 p-1 rounded bg-base shrink-0">
                    {getIcon(notif.category)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary truncate">
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-secondary font-mono shrink-0">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary leading-normal font-light">
                      {notif.body}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={() => handleToggleRead(notif.id)}
                        className="text-[10px] font-medium text-secondary hover:text-bronze flex items-center space-x-1 cursor-pointer"
                        title={notif.read ? "Mark as unread" : "Mark as read"}
                      >
                        <Check className={`h-3 w-3 ${notif.read ? "text-bronze" : "text-secondary/40"}`} />
                        <span>{notif.read ? "Read" : "Mark Read"}</span>
                      </button>
                      <button
                        onClick={() => handleArchive(notif.id)}
                        className="text-[10px] font-medium text-secondary hover:text-error flex items-center space-x-1 cursor-pointer"
                        title="Archive Notification"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Archive</span>
                      </button>
                    </div>
                  </div>

                  {/* Unread circle dot */}
                  {!notif.read && (
                    <Circle className="h-1.5 w-1.5 rounded-full fill-gold stroke-gold shrink-0 mt-1" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-secondary text-xs font-light select-none">
                No active notifications.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-muted bg-sidebar/35 text-[9px] text-secondary text-center select-none font-mono">
            JR Control Realtime Security Center
          </div>
        </div>
      )}
    </div>
  );
}
