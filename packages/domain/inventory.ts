export const INVENTORY_STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  LOW_STOCK: "LOW_STOCK",
} as const;

export type InventoryStockStatus = typeof INVENTORY_STOCK_STATUS[keyof typeof INVENTORY_STOCK_STATUS];
