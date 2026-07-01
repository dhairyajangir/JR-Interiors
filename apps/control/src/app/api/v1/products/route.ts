import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../features/auth/utils";
import { listProducts } from "../../../../features/products/services/product-service";
import { ProductQuerySchema } from "../../../../features/products/validators/product";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Request
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Session expired or missing.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and Validate Query Parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const room = searchParams.get("room") || undefined;
    const type = searchParams.get("type") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;
    const cursor = searchParams.get("cursor") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrder = searchParams.get("sortOrder") || undefined;

    const limitVal = searchParams.get("limit");
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;
    const minPriceVal = searchParams.get("minPrice");
    const minPrice = minPriceVal ? parseInt(minPriceVal, 10) : undefined;
    const maxPriceVal = searchParams.get("maxPrice");
    const maxPrice = maxPriceVal ? parseInt(maxPriceVal, 10) : undefined;
    const inStockVal = searchParams.get("inStock");
    const inStock = inStockVal !== null ? inStockVal === "true" : undefined;

    const validated = ProductQuerySchema.parse({
      search,
      status,
      categoryId,
      room,
      type,
      sellerId,
      limit,
      cursor,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      inStock,
    });

    // 3. Execute List Operation (Includes Service RBAC mapping)
    const result = await listProducts(
      {
        search: validated.search,
        status: validated.status,
        categoryId: validated.categoryId,
        room: validated.room,
        type: validated.type,
        sellerId: validated.sellerId,
        minPrice: validated.minPrice,
        maxPrice: validated.maxPrice,
        inStock: validated.inStock,
      },
      {
        cursor: validated.cursor,
        limit: validated.limit,
        field: validated.sortBy,
        order: validated.sortOrder,
      },
      currentUser
    );

    // 4. Return standard envelopes matching documentation standards
    return NextResponse.json({
      success: true,
      data: result.nodes,
      pagination: {
        total: result.totalCount,
        limit: validated.limit,
        hasNextPage: result.pageInfo.hasNextPage,
        endCursor: result.pageInfo.endCursor,
      },
      error: null,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_PAYLOAD",
            message: "Invalid query parameters parsed.",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    const code = message.includes("permission") || message.includes("denied") ? "FORBIDDEN" : "INTERNAL_ERROR";
    const status = code === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code,
          message,
        },
      },
      { status }
    );
  }
}
