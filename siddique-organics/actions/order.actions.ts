"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

interface ActionResponse {
  success: boolean;
  message: string;
  orderId?: string;
  data?: unknown;
}

/**
 * Server Action to handle secure single-page checkout, dynamic shipping verification, and atomic stock decrements.
 */
export async function submitCustomerOrder(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const customerName = formData.get("customerName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const productId = formData.get("productId") as string;
    const weight = formData.get("weight") as string;
    const quantityStr = formData.get("quantity") as string;

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
    if (!productId || !weight || !quantityStr) {
      return {
        success: false,
        message: "Product specifications and volume metrics are missing.",
      };
    }

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > 5) {
      return {
        success: false,
        message:
          "Invalid quantity parameters. Maximum 5 units allowed per order.",
      };
    }

    // Explicitly typing the transaction execution context to avoid implicit any errors
    const order = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(
          "Target product no longer exists in our database directory.",
        );
      }

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Only ${product.stock} units available for this item.`,
        );
      }

      const unitPrice =
        weight === "500g" ? product.price500g : product.price1kg;
      const subtotal = unitPrice * quantity;

      const deliveryCharge = 100;
      const totalAmount = subtotal + deliveryCharge;

      const newOrder = await tx.order.create({
        data: {
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          totalAmount,
          status: "PENDING",
          items: {
            create: {
              productId,
              weight,
              quantity,
            },
          },
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      return newOrder;
    });

    revalidatePath("/");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Order placed successfully! Cash on Delivery confirmed.",
      orderId: order.id,
    };
  } catch (error) {
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
 */
export async function trackOrderByPhone(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const phone = formData.get("phone") as string;

    if (!phone || !/^(?:\+88|88)?(01[3-9]\d{8})\$/.test(phone.trim())) {
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
            weight: true,
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
      data: orders,
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
