import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="p-4 bg-error-bg border border-error-border rounded-full text-error mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>
      
      <span className="text-[10px] uppercase tracking-widest text-bronze font-semibold mb-2">
        Error 403
      </span>
      
      <h1 className="text-3xl font-semibold tracking-tight text-primary mb-3">
        Access Denied
      </h1>
      
      <p className="text-sm text-secondary max-w-md mb-8 font-light leading-relaxed">
        Your account profile does not possess the credentials or privileges required to access this feature. If you believe this is an error, please contact your administrator.
      </p>
      
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-bronze hover:bg-[#865335] text-white text-xs font-medium rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bronze"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
