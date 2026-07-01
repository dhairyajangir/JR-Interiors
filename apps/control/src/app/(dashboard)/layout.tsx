import React from "react";
import { requireAuth } from "../../features/auth/utils";
import { LogoutButton } from "../../features/auth/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side authentication check
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <header className="border-b border-muted bg-panel px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase tracking-widest text-bronze font-semibold">
              JR Control
            </span>
            <span className="h-4 w-px bg-muted" />
            <span className="text-xs text-secondary font-mono">{user.role} Console</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-primary">{user.fullName}</p>
              <p className="text-[10px] text-secondary">{user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-7xl p-6">{children}</main>
    </div>
  );
}
