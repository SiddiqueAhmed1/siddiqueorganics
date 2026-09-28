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
  /** Optional so carts saved before this field existed still load. */
  image?: string;
}

/** Must match MAX_QUANTITY_PER_ITEM in actions/order.actions.ts */
export const MAX_QTY_PER_ITEM = 5;

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

  if (existing) {
    existing.quantity = Math.min(MAX_QTY_PER_ITEM, existing.quantity + quantity);
    // Backfill the image for lines saved before images were tracked.
    if (!existing.image && item.image) existing.image = item.image;
  } else {
    cart.push({ ...item, quantity: Math.min(MAX_QTY_PER_ITEM, quantity) });
  }

  saveCart(cart);
}

/** Sets the exact quantity for a line (id + weight). Removing a line
 * entirely is just `updateQuantity(id, weight, 0)`. */
export function updateQuantity(id: string, weight: string, quantity: number) {
  const cart = getCart();
  if (quantity < 1) {
    saveCart(cart.filter((c) => !(c.id === id && c.weight === weight)));
    return;
  }
  saveCart(
    cart.map((c) =>
      c.id === id && c.weight === weight
        ? { ...c, quantity: Math.min(MAX_QTY_PER_ITEM, quantity) }
        : c,
    ),
  );
}

export function removeFromCart(id: string, weight: string) {
  saveCart(getCart().filter((c) => !(c.id === id && c.weight === weight)));
}

/** Removes every line for a product id, regardless of weight — used to
 * recover from a checkout rejection ("product no longer available"). */
export function removeAllByProductId(id: string) {
  saveCart(getCart().filter((c) => c.id !== id));
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotals(cart: CartItem[] = getCart()) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { totalItems, totalPrice };
}

// --- Express checkout ("Buy Now") ---
// Stored separately in sessionStorage (tab-scoped, one-time use) so it
// NEVER overwrites the customer's saved cart. The checkout page checks
// this first; if present, it checks out only this item and leaves the
// real cart untouched.
const EXPRESS_ITEM_KEY = "siddique_express_item";

export function setExpressCheckoutItem(
  item: Omit<CartItem, "quantity">,
  quantity = 1,
) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    EXPRESS_ITEM_KEY,
    JSON.stringify({ ...item, quantity }),
  );
}

export function getExpressCheckoutItem(): CartItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EXPRESS_ITEM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearExpressCheckoutItem() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EXPRESS_ITEM_KEY);
}
