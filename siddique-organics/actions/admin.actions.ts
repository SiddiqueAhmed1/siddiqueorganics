"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

interface AdminActionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * SECTION A: PRODUCT MANAGEMENT
 * Server Action to add a brand new premium organic product into the store inventory.
 */
export async function createProduct(
  prevState: AdminActionResponse | null,
  formData: FormData,
): Promise<AdminActionResponse> {
  try {
    const name = formData.get("name") as string | null;
    const slug = formData.get("slug") as string | null;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string | null;
    const price500gStr = formData.get("price500g") as string | null;
    const price1kgStr = formData.get("price1kg") as string | null;
    const stockStr = formData.get("stock") as string | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (
      !name ||
      !slug ||
      !description ||
      !category ||
      !price500gStr ||
      !price1kgStr ||
      !stockStr
    ) {
      return {
        success: false,
        message: "All 8 mandatory product fields must be filled correctly.",
      };
    }

    const price500g = parseFloat(price500gStr);
    const price1kg = parseFloat(price1kgStr);
    const stock = parseInt(stockStr, 10);

    if (isNaN(price500g) || isNaN(price1kg) || isNaN(stock)) {
      return {
        success: false,
        message: "Pricing and stock values must be valid numeric indicators.",
      };
    }

    await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        category: category.trim().toLowerCase(),
        price500g,
        price1kg,
        stock,
        images: imageUrl ? [imageUrl.trim()] : [],
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return {
      success: true,
      message: "New organic product cataloged successfully!",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Product insertion failure.";
    console.error("Dashboard createProduct process crash:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

/**
 * Update an existing product parameter dataset within the repository maps.
 */
export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<AdminActionResponse> {
  try {
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const price500gStr = formData.get("price500g") as string | null;
    const price1kgStr = formData.get("price1kg") as string | null;
    const stockStr = formData.get("stock") as string | null;

    // TypeScript strict evaluation wrapper without explicit dynamic any bindings
    type ProductUpdatePayload = {
      name?: string;
      description?: string;
      price500g?: number;
      price1kg?: number;
      stock?: number;
    };

    const dataToUpdate: ProductUpdatePayload = {};
    if (name) dataToUpdate.name = name.trim();
    if (description) dataToUpdate.description = description.trim();

    if (price500gStr) {
      const p500 = parseFloat(price500gStr);
      if (!isNaN(p500)) dataToUpdate.price500g = p500;
    }
    if (price1kgStr) {
      const p1k = parseFloat(price1kgStr);
      if (!isNaN(p1k)) dataToUpdate.price1kg = p1k;
    }
    if (stockStr) {
      const stk = parseInt(stockStr, 10);
      if (!isNaN(stk)) dataToUpdate.stock = stk;
    }

    await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Product profiles updated instantly." };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Product update failure.";
    return { success: false, message: errorMessage };
  }
}

/**
 * SECTION B: ORDER & INVENTORY MANAGEMENT WITH MARGIN METRICS
 * Updates the lifecycle pipeline status of a targeted customer order.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
): Promise<AdminActionResponse> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `Order routing milestone updated to [${newStatus}]`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Pipeline mutation crash.";
    return { success: false, message: errorMessage };
  }
}

/**
 * Analytical Engine Action to compute total sales, pending loads, and business margin indexes.
 */
export async function getDashboardOverviewMetrics(): Promise<AdminActionResponse> {
  try {
    const COST_PRICE_FACTOR = 0.6;

    const allOrders = await prisma.order.findMany({
      where: { NOT: { status: "CANCELLED" } },
    });

    const pendingOrdersCount = await prisma.order.count({
      where: { status: "PENDING" },
    });
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const estimatedGrossProfit = totalRevenue * (1 - COST_PRICE_FACTOR);

    return {
      success: true,
      message: "Overview metrics aggregated.",
      data: {
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrdersCount,
        grossMargin: Math.round(estimatedGrossProfit),
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Metrics extraction error.";
    return { success: false, message: errorMessage };
  }
}

/**
 * SECTION C: CUSTOMER LOG INDEXES
 * Mappings for the customer dashboard panel to filter historical logs.
 */
export async function getCustomerDirectoryLog(): Promise<AdminActionResponse> {
  try {
    const uniqueCustomerOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        phone: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: "Customer records gathered.",
      data: uniqueCustomerOrders,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Customer tracking extraction failure.";
    return { success: false, message: errorMessage };
  }
}
