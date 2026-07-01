"use client";

import React from "react";
import { useAuth } from "../hooks";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout, isLoading } = useAuth();

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className="inline-flex items-center space-x-1.5 py-1.5 px-3 border border-heavy hover:border-bronze hover:text-bronze text-xs font-medium rounded-md bg-panel transition-all disabled:opacity-50 cursor-pointer"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{isLoading ? "Signing Out..." : "Sign Out"}</span>
    </button>
  );
}
