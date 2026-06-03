"use client";

import { useState } from "react";
import { approveListing, rejectListing } from "@/app/admin-actions";

export function ListingModeration({ id }: { id: string }) {
  const [rejecting, setRejecting] = useState(false);

  if (rejecting) {
    return (
      <form action={rejectListing} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input type="hidden" name="id" value={id} />
        <input
          name="note"
          required
          placeholder="Reason (shown to seller)"
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-label-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none flex-1 min-w-0"
        />
        <div className="flex gap-2">
          <button type="submit" className="text-label-sm bg-error text-on-error px-4 py-2 rounded-lg hover:opacity-90 transition">Reject</button>
          <button type="button" onClick={() => setRejecting(false)} className="text-label-sm text-on-surface-variant px-3 py-2">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <form action={approveListing}>
        <input type="hidden" name="id" value={id} />
        <button className="text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition">Approve</button>
      </form>
      <button onClick={() => setRejecting(true)} className="text-label-sm border border-outline-variant text-primary px-4 py-2 rounded-lg hover:bg-surface-container transition">
        Reject
      </button>
    </div>
  );
}
