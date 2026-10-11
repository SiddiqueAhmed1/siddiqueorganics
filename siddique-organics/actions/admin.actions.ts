"use server";

import prisma from "../lib/prisma";
import { requireSession } from "../lib/session";
import { revalidatePath } from "next/cache";

interface AdminActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";

type VariantInput = {
  id?: string; // present when editing an existing variant
  size: string;
  price: number;
  discount: number; // flat ৳ off the list price, 0 = none
  stock: number;
  sku?: string;
};

/** Reads a Prisma error code (P2002, P2003, P2025...) without importing the generated client. */
function hasCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  );
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSku(slug: string, size: string): string {
  return `${slug}-${size}`
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function cleanImages(formData: FormData, allowLegacyLocal = false): string[] {
  return formData
    .getAll("images")
    .map(String)
    .filter(
      (u) =>
        u.startsWith(CLOUDINARY_PREFIX) ||
        (allowLegacyLocal && u.startsWith("/")),
    );
}

/** Category uses ONE image: takes the first value of the uploader's `images` field (or a plain `image` field). */
function pickImage(formData: FormData): string {
  const all = [...formData.getAll("images"), formData.get("image")]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  return all[0] ?? "";
}

/** Parses + validates the JSON `variants` field sent by the product form. */
function parseVariants(
  raw: FormDataEntryValue | null,
): { variants: VariantInput[] } | { error: string } {
  if (typeof raw !== "string" || !raw) {
    return { error: "At least one variant (size, price, stock) is required." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Variants data is malformed." };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "At least one variant (size, price, stock) is required." };
  }
  if (parsed.length > 20)
    return { error: "A product can have at most 20 variants." };

  const variants: VariantInput[] = [];
  const sizes = new Set<string>();
  const skus = new Set<string>();

  for (const item of parsed as Record<string, unknown>[]) {
    const size = typeof item.size === "string" ? item.size.trim() : "";
    const price = Number(item.price);
    // Discount is optional (older forms don't send it) and defaults to 0.
    const discount =
      item.discount === undefined || item.discount === null || item.discount === ""
        ? 0
        : Number(item.discount);
    const stock = Number(item.stock);
    const sku =
      typeof item.sku === "string" && item.sku.trim()
        ? item.sku.trim().toUpperCase()
        : undefined;
    const id = typeof item.id === "string" && item.id ? item.id : undefined;

    if (!size || size.length > 30)
      return { error: "Every variant needs a size (max 30 chars)." };
    if (!Number.isFinite(price) || price <= 0)
      return { error: `Invalid price for size "${size}".` };
    if (!Number.isFinite(discount) || discount < 0)
      return { error: `Invalid discount for size "${size}".` };
    if (discount >= price)
      return {
        error: `Discount for size "${size}" must be less than its price (৳${price}).`,
      };
    if (!Number.isInteger(stock) || stock < 0)
      return { error: `Invalid stock for size "${size}".` };

    const sizeKey = size.toLowerCase();
    if (sizes.has(sizeKey)) return { error: `Duplicate size "${size}".` };
    sizes.add(sizeKey);

    if (sku) {
      if (skus.has(sku)) return { error: `Duplicate SKU "${sku}".` };
      skus.add(sku);
    }
    variants.push({ id, size, price, discount, stock, sku });
  }
  return { variants };
}

function uniqueConflictMessage(error: unknown): string {
  const target = (error as { meta?: { target?: unknown } }).meta?.target;
  const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
  if (t.includes("sku"))
    return "A variant SKU already exists. SKUs must be unique.";
  if (t.includes("slug")) return "This slug is already in use.";
  if (t.includes("name")) return "This name is already in use.";
  return "A record with the same unique value already exists.";
}

function fail(error: unknown, fallback: string): AdminActionResponse {
  console.error(fallback, error);
  if (hasCode(error, "P2002"))
    return { success: false, message: uniqueConflictMessage(error) };
  return {
    success: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

/* -------------------------------------------------------------------------- */
/*                            SECTION A: CATEGORIES                           */
/* -------------------------------------------------------------------------- */

export async function createCategory(
  prevState: AdminActionResponse | null,
  formData: FormData,
): Promise<AdminActionResponse> {
  try {
    await requireSession();
    const name = str(formData, "name");
    const slug = slugify(str(formData, "slug") || name);
    const image = pickImage(formData);

    if (!name || !slug)
      return { success: false, message: "Category name is required." };
    if (image && !image.startsWith(CLOUDINARY_PREFIX)) {
      return {
        success: false,
        message: "Category image must be an uploaded Cloudinary image.",
      };
    }

    const category = await prisma.category.create({
      data: { name, slug, image: image || null },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Category created.",
      data: { id: category.id },
    };
  } catch (error) {
    return fail(error, "Category creation failure.");
  }
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<AdminActionResponse> {
  try {
    await requireSession();
    const name = str(formData, "name");
    const slug = str(formData, "slug");
    const image = pickImage(formData);

    if (image && !image.startsWith(CLOUDINARY_PREFIX)) {
      return {
        success: false,
        message: "Category image must be an uploaded Cloudinary image.",
      };
    }

    await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug: slugify(slug) } : {}),
        // The edit form always submits the uploader, so an empty value means "remove image".
        image: image || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    return { success: true, message: "Category updated." };
  } catch (error) {
    if (hasCode(error, "P2025"))
      return { success: false, message: "Category not found." };
    return fail(error, "Category update failure.");
  }
}

export async function deleteCategory(id: string): Promise<AdminActionResponse> {
  try {
    await requireSession();
    await prisma.category.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted." };
  } catch (error) {
    if (hasCode(error, "P2003")) {
      return {
        success: false,
        message: "This category still has products. Move or delete them first.",
      };
    }
    if (hasCode(error, "P2025"))
      return { success: false, message: "Category not found." };
    return fail(error, "Category delete failure.");
  }
}

export async function getCategories(): Promise<
  AdminActionResponse<
    {
      id: string;
      name: string;
      slug: string;
      image: string | null;
      productCount: number;
    }[]
  >
> {
  try {
    await requireSession();
    const rows = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return {
      success: true,
      message: "Categories loaded.",
      data: rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        productCount: c._count.products,
      })),
    };
  } catch (error) {
    return fail(error, "Category fetch failure.");
  }
}

/* -------------------------------------------------------------------------- */
/*                        SECTION B: PRODUCTS + VARIANTS                      */
/* -------------------------------------------------------------------------- */

/**
 * Creates a product and all of its variants atomically.
 * Expects FormData: name, slug?, description, categoryId, images[], variants (JSON string).
 */
export async function createProduct(
  prevState: AdminActionResponse | null,
  formData: FormData,
): Promise<AdminActionResponse> {
  try {
    await requireSession();

    const name = str(formData, "name");
    const description = str(formData, "description");
    const categoryId = str(formData, "categoryId");
    const slug = slugify(str(formData, "slug") || name);

    if (!name || !slug || !description || !categoryId) {
      return {
        success: false,
        message: "Name, slug, description and category are required.",
      };
    }

    const parsed = parseVariants(formData.get("variants"));
    if ("error" in parsed) return { success: false, message: parsed.error };

    const images = cleanImages(formData);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: { name, slug, description, categoryId, images },
        select: { id: true },
      });

      await tx.productVariant.createMany({
        data: parsed.variants.map((v) => ({
          productId: created.id,
          size: v.size,
          price: v.price,
          discount: v.discount,
          stock: v.stock,
          sku: v.sku ?? buildSku(slug, v.size),
        })),
      });

      return created;
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "New product cataloged successfully!",
      data: { id: product.id },
    };
  } catch (error) {
    if (hasCode(error, "P2003")) {
      return {
        success: false,
        message: "The selected category does not exist.",
      };
    }
    return fail(error, "Product insertion failure.");
  }
}

/**
 * Updates a product and syncs its variants atomically:
 *  - variants with a known `id`   -> updated
 *  - variants without an `id`     -> created
 *  - existing variants not sent   -> deleted (past orders keep their `size` snapshot)
 * The slug is intentionally immutable so public URLs never break.
 */
export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<AdminActionResponse> {
  try {
    await requireSession();

    const name = str(formData, "name");
    const description = str(formData, "description");
    const categoryId = str(formData, "categoryId");

    const parsed = parseVariants(formData.get("variants"));
    if ("error" in parsed) return { success: false, message: parsed.error };
    const variants = parsed.variants;

    const images = cleanImages(formData, true);

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(description ? { description } : {}),
          ...(categoryId ? { categoryId } : {}),
          images,
        },
        select: { slug: true },
      });

      const existing = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((v) => v.id));
      const keptIds = new Set(
        variants
          .filter((v) => v.id && existingIds.has(v.id))
          .map((v) => v.id as string),
      );
      const removeIds = [...existingIds].filter((vid) => !keptIds.has(vid));

      // Delete first so freed sizes/SKUs can be reused in the same save.
      if (removeIds.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: removeIds } },
        });
      }

      for (const v of variants) {
        if (v.id && existingIds.has(v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              price: v.price,
              discount: v.discount,
              stock: v.stock,
              ...(v.sku ? { sku: v.sku } : {}),
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              price: v.price,
              discount: v.discount,
              stock: v.stock,
              sku: v.sku ?? buildSku(product.slug, v.size),
            },
          });
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { success: true, message: "Product updated successfully." };
  } catch (error) {
    if (hasCode(error, "P2025"))
      return { success: false, message: "Product not found." };
    if (hasCode(error, "P2003")) {
      return {
        success: false,
        message: "The selected category does not exist.",
      };
    }
    return fail(error, "Product update failure.");
  }
}

/** Delete a product. Variants cascade; products that already have orders are blocked by the DB. */
export async function deleteProduct(id: string): Promise<AdminActionResponse> {
  try {
    await requireSession();
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted." };
  } catch (error) {
    if (hasCode(error, "P2003")) {
      return {
        success: false,
        message:
          "Products with past orders cannot be deleted; set all variant stock to 0 instead.",
      };
    }
    return fail(error, "Delete failed.");
  }
}

/* -------------------------------------------------------------------------- */
/*                 SECTION C: ORDERS, METRICS & CUSTOMER LOGS                 */
/* -------------------------------------------------------------------------- */

export async function updateOrderStatus(
  orderId: string,
  newStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
): Promise<AdminActionResponse> {
  try {
    await requireSession();
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    return {
      success: true,
      message: `Order routing milestone updated to [${newStatus}]`,
    };
  } catch (error) {
    return fail(error, "Pipeline mutation crash.");
  }
}

export async function getDashboardOverviewMetrics(): Promise<AdminActionResponse> {
  try {
    await requireSession();
    const COST_PRICE_FACTOR = 0.6;

    const [agg, pendingOrdersCount] = await Promise.all([
      prisma.order.aggregate({
        where: { NOT: { status: "CANCELLED" } },
        _count: true,
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    const totalRevenue = agg._sum.totalAmount ?? 0;

    return {
      success: true,
      message: "Overview metrics aggregated.",
      data: {
        totalOrders: agg._count,
        totalRevenue,
        pendingOrdersCount,
        grossMargin: Math.round(totalRevenue * (1 - COST_PRICE_FACTOR)),
      },
    };
  } catch (error) {
    return fail(error, "Metrics extraction error.");
  }
}

export async function getCustomerDirectoryLog(): Promise<AdminActionResponse> {
  try {
    await requireSession();
    const orders = await prisma.order.findMany({
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
      data: orders,
    };
  } catch (error) {
    return fail(error, "Customer tracking extraction failure.");
  }
}

/* -------------------------------------------------------------------------- */
/*                                  INVENTORY                                 */
/* -------------------------------------------------------------------------- */

/** Sets the exact stock for one size (variant). Used by the admin Inventory page. */
export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<AdminActionResponse> {
  try {
    await requireSession();
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
      return {
        success: false,
        message: "Stock must be a whole number between 0 and 100000.",
      };
    }
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    return { success: true, message: "Stock updated." };
  } catch (error) {
    if (hasCode(error, "P2025"))
      return { success: false, message: "Variant not found." };
    return fail(error, "Stock update failed.");
  }
}
