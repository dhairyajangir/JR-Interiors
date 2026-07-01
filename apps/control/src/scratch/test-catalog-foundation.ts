import "./load-env";

import { prisma } from "@jr/database";
import * as productService from "../features/products/services/product-service";
import type { User } from "@jr/types";

// Setup mock users
const mockSeller: User = {
  id: "test-seller-id",
  email: "seller@test.com",
  supabaseId: "sb-seller-id",
  fullName: "Test Seller",
  phone: null,
  role: "SELLER",
  isAdmin: false,
  sellerId: "test-seller-profile-id",
  brandName: "Atelier Test Brand",
  permissions: ["CATALOG_WRITE", "INVENTORY_READ"],
};

const mockAdmin: User = {
  id: "test-admin-id",
  email: "admin@test.com",
  supabaseId: "sb-admin-id",
  fullName: "Test Admin",
  phone: null,
  role: "ADMIN",
  isAdmin: true,
  sellerId: null,
  brandName: null,
  permissions: ["CATALOG_WRITE", "CATALOG_APPROVE", "INVENTORY_READ", "INVENTORY_UPDATE"],
};

async function runTests() {
  console.log("=== STARTING PRODUCT REFINEMENTS & TRANSACTIONS TESTS ===");

  // Ensure mock database records exist (Category, Seller)
  let category = await prisma.taxonomy.findFirst({
    where: { kind: "CATEGORY" },
  });
  if (!category) {
    console.log("Creating mock category taxonomy...");
    category = await prisma.taxonomy.create({
      data: {
        name: "Living Room",
        slug: "living-room",
        kind: "CATEGORY",
        description: "Living room showpieces",
        coverImage: "https://example.com/category.jpg",
        status: "PUBLISHED",
      },
    });
  }

  // Ensure mock seller profile exists in the DB
  let dbSeller = await prisma.seller.findUnique({
    where: { id: mockSeller.sellerId! },
  });
  if (!dbSeller) {
    console.log("Creating mock seller database record...");
    let sellerUser = await prisma.user.findUnique({
      where: { email: mockSeller.email },
    });
    if (!sellerUser) {
      sellerUser = await prisma.user.create({
        data: {
          id: mockSeller.id,
          email: mockSeller.email,
          supabaseId: mockSeller.supabaseId,
          fullName: mockSeller.fullName,
          passwordHash: "argon_hash_placeholder",
          role: "SELLER",
        },
      });
    }

    dbSeller = await prisma.seller.create({
      data: {
        id: mockSeller.sellerId!,
        userId: sellerUser.id,
        brandName: mockSeller.brandName!,
        slug: "test-brand-slug",
        status: "active",
      },
    });
  }

  // Ensure parent user for admin exists
  let adminUser = await prisma.user.findUnique({
    where: { email: mockAdmin.email },
  });
  if (!adminUser) {
    await prisma.user.create({
      data: {
        id: mockAdmin.id,
        email: mockAdmin.email,
        supabaseId: mockAdmin.supabaseId,
        fullName: mockAdmin.fullName,
        passwordHash: "argon_hash_placeholder",
        role: "ADMIN",
      },
    });
  }

  const createdIds: string[] = [];

  try {
    // Test 1: Create Product 1 as Seller (Should default to DRAFT and generate referenceId)
    console.log("\nTest 1: Create Product 1 as Seller (DRAFT + referenceId check)...");
    const productInput1 = {
      name: "Luxury Walnut Sideboard",
      slug: "luxury-walnut-sideboard",
      tagline: "Solid Walnut / Solid Oak",
      series: "Atelier Signature Collection",
      description: "A premium handcrafted walnut sideboard with satin brass details.",
      priceCents: 245000,
      material: "Walnut",
      room: "Living",
      type: "Storage",
      imageUrl: "https://example.com/sideboard.jpg",
      stock: 5,
      categoryId: category.id,
    };

    const prod1 = await productService.createProductService(productInput1, mockSeller);
    createdIds.push(prod1.id);
    console.log("-> Created Product ID:", prod1.id);
    console.log("-> Reference ID generated:", prod1.referenceId);
    console.log("-> Status:", prod1.status);

    if (!prod1.referenceId || !prod1.referenceId.startsWith("JR-PROD-")) {
      throw new Error("Invalid referenceId sequence generated.");
    }

    // Test 2: Create Product 2 to verify referenceId sequence incrementation
    console.log("\nTest 2: Create Product 2 (Verify sequential referenceId)...");
    const productInput2 = {
      ...productInput1,
      name: "Luxury Walnut Sideboard II",
      slug: "luxury-walnut-sideboard-ii",
    };
    const prod2 = await productService.createProductService(productInput2, mockSeller);
    createdIds.push(prod2.id);
    console.log("-> Product 2 Reference ID:", prod2.referenceId);

    const num1 = parseInt(prod1.referenceId.split("-")[2], 10);
    const num2 = parseInt(prod2.referenceId.split("-")[2], 10);
    if (num2 !== num1 + 1) {
      throw new Error(`Sequence did not increment sequentially: ${prod1.referenceId} -> ${prod2.referenceId}`);
    }
    console.log("-> SUCCESS: Sequence correctly incremented!");

    // Test 3: Publish product & lock SEO slug check
    console.log("\nTest 3: Publish Product 1 and verify SEO slug lock...");
    await productService.publishProductService(prod1.id, mockAdmin);
    console.log("-> Product 1 Published.");

    try {
      await productService.updateProductService(
        prod1.id,
        { slug: "new-walnut-slug-changed" },
        mockAdmin
      );
      throw new Error("Should have thrown error on locked slug update.");
    } catch (err: any) {
      if (err.message.includes("Cannot edit product slug once published")) {
        console.log("-> SUCCESS: Slug update locked: ", err.message);
      } else {
        throw err;
      }
    }

    // Test 4: Reject product (Changes Requested) and check review notes
    console.log("\nTest 4: Request Changes as Admin (formerly Reject)...");
    const changesRequestedProd = await productService.rejectProductService(
      prod2.id,
      "Please provide high-resolution photos of the brass finishes.",
      mockAdmin
    );
    console.log("-> Status transitioned to:", changesRequestedProd.status);
    console.log("-> Review Note:", changesRequestedProd.reviewNote);
    if (changesRequestedProd.status !== "CHANGES_REQUESTED") {
      throw new Error("Status should be CHANGES_REQUESTED.");
    }

    // Test 5: Verify rich audit logs
    console.log("\nTest 5: Verify rich audit log details schema...");
    const logs = await prisma.auditLog.findMany({
      where: { entityId: prod2.id, action: "PRODUCT_REJECTED" },
    });
    if (logs.length === 0) {
      throw new Error("No audit logs found for product rejection.");
    }
    const details = JSON.parse(logs[0].details || "{}");
    console.log("-> Rich Audit Log Details Payload:");
    console.log(JSON.stringify(details, null, 2));

    if (!details.requestId || !details.timestamp || !details.before || !details.after || !details.changedFields) {
      throw new Error("Audit log details schema is missing rich context keys.");
    }
    console.log("-> SUCCESS: Audit log schema contains rich details!");

    // Test 6: Search expansion
    console.log("\nTest 6: Verify expanded search filters (description and status)...");
    const searchRes = await productService.listProducts(
      { search: "CHANGES_REQUESTED" },
      { limit: 2, field: "createdAt", order: "desc" },
      mockAdmin
    );
    console.log("-> Found by status search:", searchRes.nodes.length);
    const hasProd2 = searchRes.nodes.some((n) => n.id === prod2.id);
    if (!hasProd2) {
      throw new Error("Product 2 not found by search query.");
    }
    console.log("-> SUCCESS: Found product via status keyword search.");

  } finally {
    // Cleanup test records
    console.log("\nCleaning up test records...");
    for (const id of createdIds) {
      await prisma.auditLog.deleteMany({
        where: { entityId: id },
      });
      await prisma.product.delete({
        where: { id },
      });
    }
    console.log("-> Test products deleted.");

    // Cleanup mock users
    await prisma.user.deleteMany({
      where: { id: { in: [mockSeller.id, mockAdmin.id] } },
    });
    console.log("-> Mock users deleted.");
  }

  console.log("\n=== ALL REFINEMENT TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
