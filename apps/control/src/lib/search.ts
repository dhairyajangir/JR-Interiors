/**
 * Helper to build Prisma case-insensitive search queries across multiple fields
 */
export function buildSearchQuery(
  query: string | undefined,
  fields: string[]
): Record<string, any> | undefined {
  if (!query || query.trim() === "") return undefined;

  const trimmedQuery = query.trim();

  // Return OR array matching the query against any of the fields
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: trimmedQuery,
        mode: "insensitive",
      },
    })),
  };
}
