export const CRM_LEAD_STATUS = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
} as const;

export type CrmLeadStatus = typeof CRM_LEAD_STATUS[keyof typeof CRM_LEAD_STATUS];
