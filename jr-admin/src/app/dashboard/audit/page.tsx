import { DashboardShell } from "@/components/DashboardShell";
import { getAuditLogs } from "@/lib/audit";
import { formatDate } from "@/lib/format";
import { formatCompactNumber, requireDashboardAdmin, statusTone } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const user = await requireDashboardAdmin();
  const entries = await getAuditLogs({ limit: 100 });

  return (
    <DashboardShell user={user} currentPath="/dashboard/audit">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Audit log</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Security Audit Log</h1>
        <p className="mt-1 text-sm text-steel">
          Track dashboard logins, demo access events, and write mutations for platform security auditing.
        </p>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold text-ink">Security audit log</h2>
          <p className="text-sm text-steel">{formatCompactNumber(entries.length)} audit records loaded</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-line bg-sand/70 text-steel font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Actor info</th>
                <th className="px-6 py-3 font-semibold">Activity details</th>
                <th className="px-6 py-3 font-semibold">IP address</th>
                <th className="px-6 py-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-sand/30 transition">
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusTone(entry.action)}`}>
                      {entry.action.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-ink">{entry.user.fullName}</p>
                    <p className="mt-0.5 text-steel font-medium">{entry.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-steel font-medium">
                    <p className="leading-relaxed">{entry.details ?? "-"}</p>
                    {entry.entity ? (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-steel/50">
                        {entry.entity}: {entry.entityId ?? ""}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-steel font-medium">{entry.ipAddress ?? "-"}</td>
                  <td className="px-6 py-4 text-steel font-medium">{formatDate(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
