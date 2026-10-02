"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

interface OrderConfirmationItem {
  productName: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderConfirmation {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  deliveryCharge: number;
  status: string;
  createdAt: string;
  items: OrderConfirmationItem[];
}

interface ActionResponse {
  success: boolean;
  message: string;
  orderId?: string;
  data?: OrderConfirmation | unknown;
  /** Present when a specific cart line caused the failure (e.g. the
   * product was deleted or is out of stock), so the client can remove
   * just that line instead of blocking the whole cart. */
  invalidItemId?: string;
}

interface CartItemInput {
  id: string;
  weight: string;
  quantity: number;
}

class OrderValidationError extends Error {
  itemId?: string;

  constructor(message: string, itemId?: string) {
    super(message);
    this.name = "OrderValidationError";
    this.itemId = itemId;
  }
}

const DELIVERY_CHARGE = 100;
const MAX_QUANTITY_PER_ITEM = 5;

/**
 * Server Action to handle secure multi-item checkout, dynamic shipping
 * verification, and atomic stock decrements across every cart line.
 *
 * IMPORTANT: only `id` (product id), `weight` (variant size) and `quantity`
 * are trusted from the client's cart. Product name and price are always re-read from the
 * database inside the transaction — never trust price from the client.
 */
export async function submitCustomerOrder(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const customerName = formData.get("customerName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const cartItemsRaw = formData.get("cartItems") as string;

    if (!customerName || customerName.trim().length < 3) {
      return {
        success: false,
        message: "Full Name must be at least 3 characters long.",
      };
    }
    if (!phone || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone.trim())) {
      return {
        success: false,
        message: "Please provide a valid 11-digit Bangladeshi mobile number.",
      };
    }
    if (!address || address.trim().length < 10) {
      return {
        success: false,
        message:
          "Please provide a complete delivery address (min 10 characters).",
      };
    }

    let cartItems: CartItemInput[] = [];
    try {
      cartItems = JSON.parse(cartItemsRaw || "[]");
    } catch {
      return {
        success: false,
        message: "Cart data could not be read. Please try again.",
      };
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    for (const item of cartItems) {
      if (
        !item.id ||
        !item.weight ||
        !item.quantity ||
        item.quantity < 1 ||
        item.quantity > MAX_QUANTITY_PER_ITEM
      ) {
        return {
          success: false,
          message: `Invalid item in cart. Maximum ${MAX_QUANTITY_PER_ITEM} units allowed per product.`,
        };
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let subtotalSum = 0;
      const orderItemsData: {
        productId: string;
        variantId: string;
        size: string;
        quantity: number;
      }[] = [];
      const confirmationItems: OrderConfirmationItem[] = [];

      for (const item of cartItems) {
        // The cart's `weight` field carries the variant's size label (e.g. "500g", "1ltr").
        // (productId + size) is unique, so this resolves exactly one variant.
        const variant = await tx.productVariant.findUnique({
          where: { productId_size: { productId: item.id, size: item.weight } },
          include: { product: { select: { name: true } } },
        });

        if (!variant) {
          throw new OrderValidationError(
            "One of the products in your cart is no longer available. It has been removed — please review your cart and try again.",
            item.id,
          );
        }
        if (variant.stock < item.quantity) {
          throw new OrderValidationError(
            `Insufficient stock for ${variant.product.name} (${variant.size}). Only ${variant.stock} units available.`,
            item.id,
          );
        }

        // Atomic reservation: the `stock >= quantity` guard prevents two
        // simultaneous orders from overselling the last units.
        const reserved = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count === 0) {
          throw new OrderValidationError(
            `${variant.product.name} (${variant.size}) just sold out. Please reduce the quantity or remove it.`,
            item.id,
          );
        }

        const unitPrice = variant.price;
        const subtotal = unitPrice * item.quantity;
        subtotalSum += subtotal;

        orderItemsData.push({
          productId: item.id,
          variantId: variant.id,
          size: variant.size,
          quantity: item.quantity,
        });
        confirmationItems.push({
          productName: variant.product.name,
          // Kept as `weight` so the order-success page keeps working unchanged.
          weight: variant.size,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      const totalAmount = subtotalSum + DELIVERY_CHARGE;

      const newOrder = await tx.order.create({
        data: {
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          totalAmount,
          status: "PENDING",
          items: { create: orderItemsData },
        },
      });

      return { newOrder, confirmationItems, totalAmount };
    });

    revalidatePath("/");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Order placed successfully! Cash on Delivery confirmed.",
      orderId: result.newOrder.id,
      data: {
        id: result.newOrder.id,
        customerName: result.newOrder.customerName,
        phone: result.newOrder.phone,
        address: result.newOrder.address,
        totalAmount: result.totalAmount,
        deliveryCharge: DELIVERY_CHARGE,
        status: result.newOrder.status,
        createdAt: result.newOrder.createdAt.toISOString(),
        items: result.confirmationItems,
      },
    };
  } catch (error) {
    if (error instanceof OrderValidationError) {
      console.error("Checkout validation failure:", error.message);
      return {
        success: false,
        message: error.message,
        invalidItemId: error.itemId,
      };
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected processing error occurred.";
    console.error("Critical checkout transactional failure:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

/**
 * UX-Optimized Direct Order Tracking via Customer Mobile Phone Number.
 * (Unchanged.)
 */
export async function trackOrderByPhone(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const phone = formData.get("phone") as string;

    if (!phone || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone.trim())) {
      return {
        success: false,
        message: "Please provide a valid Bangladeshi mobile number to track.",
      };
    }

    const orders = await prisma.order.findMany({
      where: { phone: phone.trim() },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            size: true,
            quantity: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      return {
        success: false,
        message: "No active order logs found matching this phone number.",
      };
    }

    return {
      success: true,
      message: "Customer order profiles mapped successfully.",
      // `weight` is kept in the response shape so the tracking UI needs no change.
      data: orders.map((o) => ({
        ...o,
        items: o.items.map(({ size, ...rest }) => ({ ...rest, weight: size })),
      })),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Database lookup validation failed.";
    console.error("Order tracking service verification error:", errorMessage);
    return { success: false, message: errorMessage };
  }
}
