// Single source of truth for delivery pricing.
// Imported by BOTH the checkout page (display) and the server action
// (authoritative calculation). Never trust a charge sent from the client.

export const DELIVERY_ZONES = {
  inside_dhaka: { label: "Inside Dhaka City", charge: 70 },
  outside_dhaka_city: { label: "Outside Dhaka City", charge: 100 },
  outside_dhaka: { label: "Outside Dhaka", charge: 130 },
} as const;

export type DeliveryZone = keyof typeof DELIVERY_ZONES;

export const DEFAULT_ZONE: DeliveryZone = "inside_dhaka";

export function isDeliveryZone(value: unknown): value is DeliveryZone {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(DELIVERY_ZONES, value)
  );
}

/** Returns the zone's label + charge, or null if the key is not valid. */
export function getDeliveryZone(
  value: unknown,
): { key: DeliveryZone; label: string; charge: number } | null {
  if (!isDeliveryZone(value)) return null;
  return { key: value, ...DELIVERY_ZONES[value] };
}
