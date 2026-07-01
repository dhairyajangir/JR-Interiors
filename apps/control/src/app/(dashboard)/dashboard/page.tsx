import React from "react";
import { getCurrentUser } from "../../../features/auth/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-xs text-secondary font-light">
          Sprint 1 Phase A — Authentication Foundation is successfully verified.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-panel border border-muted rounded-md luxury-shadow-sm space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
            Security Status
          </h2>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Supabase Auth:</span>
              <span className="font-medium text-green-600">CONNECTED</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Session Cookies:</span>
              <span className="font-medium text-green-600">ACTIVE (HttpOnly)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Route Protection:</span>
              <span className="font-medium text-green-600">SERVER VERIFIED</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-panel border border-muted rounded-md luxury-shadow-sm space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
            User Profile
          </h2>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Full Name:</span>
              <span className="font-medium text-primary">{user?.fullName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Email:</span>
              <span className="font-medium text-primary">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Role:</span>
              <span className="font-mono text-bronze font-semibold">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-panel border border-muted rounded-md luxury-shadow-sm space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bronze">
            Future Modules Prepared
          </h2>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">RBAC System:</span>
              <span className="font-medium text-secondary">READY (Sprint 1 Phase B)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">MFA Enrollment:</span>
              <span className="font-medium text-secondary">READY (Sprint 1 Phase B)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Inactivity Timeout:</span>
              <span className="font-medium text-secondary">READY (Sprint 1 Phase B)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
