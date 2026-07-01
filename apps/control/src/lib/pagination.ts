/**
 * Generic Cursor-Based Pagination Utility for Prisma
 */

export interface CursorPaginationArgs {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  nodes: T[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export async function paginateWithCursor<T extends { id: string }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelDelegate: any,
  options: {
    where?: Record<string, any>;
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    include?: Record<string, any>;
  }
): Promise<PaginatedResult<T>> {
  const limit = options.limit ?? 25;
  const cursor = options.cursor;
  const sortBy = options.sortBy ?? "createdAt";
  const sortOrder = options.sortOrder ?? "desc";

  // Build prisma findMany query arguments
  const queryArgs: Record<string, any> = {
    where: options.where || {},
    take: limit + 1, // fetch 1 extra item to check for next page
    orderBy: [
      { [sortBy]: sortOrder },
      { id: sortOrder } // secondary tie-breaker order to guarantee deterministic sorting
    ],
  };

  if (options.include) {
    queryArgs.include = options.include;
  }

  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1; // Skip the cursor node itself
  }

  // Get total count (for tables information)
  const totalCount = await modelDelegate.count({
    where: options.where || {},
  });

  // Query records
  const records: T[] = await modelDelegate.findMany(queryArgs);

  const hasNextPage = records.length > limit;
  const nodes = hasNextPage ? records.slice(0, limit) : records;
  const endCursor = nodes.length > 0 ? nodes[nodes.length - 1].id : null;

  return {
    nodes,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
    totalCount,
  };
}
