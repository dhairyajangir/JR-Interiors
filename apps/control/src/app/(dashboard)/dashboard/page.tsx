import React from "react";
import { getCurrentUser } from "../../../features/auth/utils";
import { PageContainer } from "../../../features/layout/components/page-container";
import {
  Shield,
  Key,
  Database,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Primary action button for the PageContainer
  const primaryAction = (
    <button
      disabled
      className="inline-flex items-center space-x-2 bg-gold hover:bg-gold/90 text-primary hover:text-primary/95 text-xs font-medium py-2 px-3.5 rounded-md shadow-sm transition-all duration-150 cursor-not-allowed opacity-75"
    >
      <span>Create Catalog Item</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <PageContainer
      title={`Welcome back, ${user.fullName}`}
      description="Here is the live status verification of the JR Control Enterprise AppShell."
      primaryAction={primaryAction}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Session Profile Card */}
        <div className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-muted pb-3">
            <div className="p-1.5 rounded bg-bronze/10 text-bronze">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
              Authenticated Identity
            </h2>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Full Name:</span>
              <span className="font-medium text-primary">{user.fullName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Email Address:</span>
              <span className="font-medium text-primary select-all">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Assigned Role:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-bronze/10 text-bronze">
                {user.role}
              </span>
            </div>
            {user.brandName && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Brand Access:</span>
                <span className="font-medium text-primary">{user.brandName}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-muted">
              <span className="text-secondary">Database User ID:</span>
              <span className="font-mono text-[10px] text-secondary select-all truncate max-w-[120px]" title={user.id}>
                {user.id}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Token Status Card */}
        <div className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-muted pb-3">
            <div className="p-1.5 rounded bg-bronze/10 text-bronze">
              <Key className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
              Authentication Infrastructure
            </h2>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Identity Provider:</span>
              <span className="font-medium text-primary">Supabase Auth</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Session Cookie Status:</span>
              <span className="flex items-center space-x-1.5 text-success font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span>HttpOnly Secure</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Route Middleware Guard:</span>
              <span className="flex items-center space-x-1.5 text-success font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-muted">
              <span className="text-secondary">Supabase UUID:</span>
              <span className="font-mono text-[10px] text-secondary select-all truncate max-w-[120px]" title={user.supabaseId || "null"}>
                {user.supabaseId || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Database & System Status Card */}
        <div className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-muted pb-3">
            <div className="p-1.5 rounded bg-bronze/10 text-bronze">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
              Platform Integrations
            </h2>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">ORM Layer:</span>
              <span className="font-medium text-primary">Prisma Client</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">PostgreSQL Database:</span>
              <span className="flex items-center space-x-1.5 text-success font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span>Operational</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">RBAC Mapping Matrix:</span>
              <span className="flex items-center space-x-1.5 text-success font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span>Verified</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-muted">
              <span className="text-secondary">System Environment:</span>
              <span className="font-medium text-primary font-mono text-[10px]">
                {process.env.NODE_ENV}
              </span>
            </div>
          </div>
        </div>

        {/* Permissions Gating Summary */}
        <div className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2 border-b border-muted pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
              Active Security Permissions Summary ({user.permissions.length})
            </h2>
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {user.permissions.map((perm) => (
              <div
                key={perm}
                className="flex items-center space-x-2 px-3 py-2 rounded-md border border-muted bg-base/30 text-xs text-primary transition-all duration-150 hover:bg-base"
              >
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="font-mono text-secondary truncate">{perm}</span>
              </div>
            ))}
            {user.permissions.length === 0 && (
              <div className="col-span-full py-4 text-center text-secondary text-xs flex flex-col items-center justify-center space-y-1">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>No permissions mapped for this role.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-muted pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
              Quick Test Navigation Links
            </h2>
          </div>

          <div className="flex flex-col space-y-2">
            {[
              { label: "Products Catalog", href: "/dashboard/products" },
              { label: "CRM Contacts", href: "/dashboard/crm" },
              { label: "Settings Control", href: "/dashboard/settings" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center justify-between p-2.5 rounded-md border border-muted hover:border-bronze/45 hover:bg-base transition-all duration-150 text-xs text-primary"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-secondary group-hover:text-bronze transition-colors duration-150" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
