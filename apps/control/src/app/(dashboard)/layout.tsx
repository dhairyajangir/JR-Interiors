import React from "react";
import { requireAuth } from "../../features/auth/utils";
import { AppShell } from "../../features/layout/components/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side authentication check
  await requireAuth();

  return <AppShell>{children}</AppShell>;
}

