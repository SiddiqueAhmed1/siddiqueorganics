/**
 * Pricing helpers shared by server actions, server pages and client components.
 *
 * Every variant stores:
 *  - `price`    → the list price (MRP) in ৳, as entered by the admin
 *  - `discount` → a flat ৳ amount taken off that list price (0 = no discount)
 *
 * The selling price is always `price - discount` (never below 0).
 * Discounts are per size because 500g and 1kg usually have different prices.
 */

/** Selling price after the flat discount. */
export function getSellPrice(price: number, discount: number | null | undefined): number {
  const d = Number(discount) || 0;
  return Math.max(0, price - Math.max(0, d));
}

/**
 * Maps a DB variant to the shape the storefront uses.
 * `price` becomes the SELLING price (so carts, totals and sorting need no change),
 * while `mrp` keeps the original price so the UI can show a strike-through.
 */
export function toStoreVariant<
  T extends { id: string; size: string; price: number; discount: number; stock: number },
>(v: T) {
  return {
    id: v.id,
    size: v.size,
    price: getSellPrice(v.price, v.discount),
    mrp: v.price,
    stock: v.stock,
  };
}
