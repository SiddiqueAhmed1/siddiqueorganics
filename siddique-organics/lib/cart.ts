"use client";

// Single source of truth for the localStorage-backed cart.
// CartButtons writes through here, FloatingCart (and the header
// cart badge, whenever you wire it up) reads through here.

export interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
}

const CART_KEY = "siddique_cart";
export const CART_SYNC_EVENT = "siddique_cart_sync";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to parse cart storage:", error);
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Same-tab listeners (FloatingCart) don't get the native "storage"
  // event, so we fire our own to trigger a re-render.
  window.dispatchEvent(new Event(CART_SYNC_EVENT));
}

/**
 * Adds `quantity` of an item to the cart, merging with an existing
 * line that has the same id + weight (increments instead of duplicating).
 */
export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.id === item.id && c.weight === item.weight,
  );

  if (existing) existing.quantity += quantity;
  else cart.push({ ...item, quantity });

  saveCart(cart);
}

/** Replaces the whole cart with a single item — used by "Buy Now". */
export function setBuyNowCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  saveCart([{ ...item, quantity }]);
}
