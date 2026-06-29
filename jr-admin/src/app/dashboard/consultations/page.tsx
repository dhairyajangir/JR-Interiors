import { updateConsultationStatus } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatCompactNumber, requireDashboardAdmin, statusTone } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const user = await requireDashboardAdmin();
  const consultations = await prisma.storefrontConsultation.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: true,
    },
  });

  return (
    <DashboardShell user={user} currentPath="/dashboard/consultations">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Consultations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Design Consultations</h1>
        <p className="mt-1 text-sm text-steel">
          Manage booking inquiries and track client follow-ups from the storefront consultations form.
        </p>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold text-ink">Request queue</h2>
          <p className="text-sm text-steel">{formatCompactNumber(consultations.length)} requests loaded</p>
        </div>
        <div className="divide-y divide-line">
          {consultations.map((consultation) => (
            <article key={consultation.id} className="flex flex-col gap-3 px-6 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-ink">{consultation.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(consultation.status)}`}>
                    {consultation.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-steel">{consultation.email} · {consultation.phone ?? "No phone captured"}</p>
                <p className="mt-1 text-xs text-steel">{consultation.projectType} · Created {formatDate(consultation.createdAt)}</p>
                {consultation.message ? (
                  <p className="mt-2 rounded-xl bg-sand/60 border border-line/30 px-3 py-2 text-xs leading-relaxed text-steel">{consultation.message}</p>
                ) : null}
              </div>
              <form action={updateConsultationStatus} className="flex flex-wrap items-center gap-3 border-t border-line/60 pt-3">
                <input type="hidden" name="id" value={consultation.id} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-steel">Status:</span>
                  <select id={`status-${consultation.id}`} name="status" defaultValue={consultation.status} className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink outline-none transition focus:border-mint">
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <button type="submit" className="rounded-full bg-ink px-4 py-1 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap">
                  Save
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
