"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useAuth } from "../features/auth/hooks";
import { NAVIGATION_CONFIG } from "../features/layout/config/navigation";
import { commandRegistry, searchRegistry, SearchResult } from "@jr/command";
import { can } from "@jr/auth";

interface CommandProviderProps {
  children: React.ReactNode;
}

const CommandContext = createContext<null>(null);

export function CommandProvider({ children }: CommandProviderProps) {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      commandRegistry.clear();
      searchRegistry.clear();
      return;
    }

    const unregisterCallbacks: (() => void)[] = [];

    // Context objects to pass to command execution
    const cmdContext = {
      router: {
        push: (href: string) => router.push(href),
        refresh: () => router.refresh(),
      },
      logout,
      user,
    };

    // 1. Walk NAVIGATION_CONFIG and register commands
    NAVIGATION_CONFIG.forEach((group) => {
      group.items.forEach((item) => {
        // Register top-level items if they have href
        if (item.href) {
          const unreg = commandRegistry.register({
            id: `nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
            title: `Go to ${item.title}`,
            description: `Navigate to ${group.groupName} > ${item.title}`,
            category: "Navigation",
            permission: item.permission,
            action: () => cmdContext.router.push(item.href!),
          });
          unregisterCallbacks.push(unreg);
        }

        // Register child sub-menu items
        if (item.children) {
          item.children.forEach((child) => {
            const unreg = commandRegistry.register({
              id: `nav-${child.title.toLowerCase().replace(/\s+/g, "-")}`,
              title: `Go to ${item.title} > ${child.title}`,
              description: `Navigate to ${group.groupName} > ${item.title} > ${child.title}`,
              category: `Navigation`,
              permission: child.permission,
              action: () => cmdContext.router.push(child.href),
            });
            unregisterCallbacks.push(unreg);
          });
        }
      });
    });

    // 2. Register profile/security shortcuts and actions
    const unregProfile = commandRegistry.register({
      id: "action-profile",
      title: "Open Profile Settings",
      description: "Manage your personal profile and display settings",
      category: "Account Settings",
      action: () => cmdContext.router.push("/dashboard/settings#profile"),
    });
    unregisterCallbacks.push(unregProfile);

    const unregSecurity = commandRegistry.register({
      id: "action-security",
      title: "Open Security Settings",
      description: "Manage passwords, sessions, and MFA keys",
      category: "Account Settings",
      permission: "SETTINGS_EDIT",
      action: () => cmdContext.router.push("/dashboard/settings#security"),
    });
    unregisterCallbacks.push(unregSecurity);

    const unregLogout = commandRegistry.register({
      id: "action-logout",
      title: "Sign Out",
      description: "End your current JR Control workspace session",
      category: "Session Actions",
      action: async () => {
        await logout();
      },
    });
    unregisterCallbacks.push(unregLogout);

    // 3. Register Navigation Search Provider
    const unregSearch = searchRegistry.register({
      id: "navigation-search",
      name: "App Navigation",
      search: (query) => {
        const cleanQuery = query.toLowerCase().trim();
        const activeCommands = commandRegistry.getCommands();

        // Filter and map matching commands that the user has permission to execute
        return activeCommands
          .filter((cmd) => {
            // Filter by permission
            if (cmd.permission && !can(user, cmd.permission)) {
              return false;
            }
            // Simple match on title or category
            return (
              cmd.title.toLowerCase().includes(cleanQuery) ||
              (cmd.description && cmd.description.toLowerCase().includes(cleanQuery)) ||
              cmd.category.toLowerCase().includes(cleanQuery)
            );
          })
          .map((cmd) => ({
            id: cmd.id,
            title: cmd.title,
            description: cmd.description || cmd.category,
            category: cmd.category,
            action: () => cmd.action(cmdContext),
          }));
      },
    });
    unregisterCallbacks.push(unregSearch);

    // Clean up registry on unmount
    return () => {
      unregisterCallbacks.forEach((cb) => cb());
    };
  }, [user, router, logout]);

  return (
    <CommandContext.Provider value={null}>
      {children}
    </CommandContext.Provider>
  );
}

export function useCommandContext() {
  return useContext(CommandContext);
}
