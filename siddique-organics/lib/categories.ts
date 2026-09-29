// Single source of truth for the storefront categories.
// `slug`  -> URL: /categories/<slug>  (matches the links on the home page)
// `match` -> values of Product.category (case-insensitive) that belong to it.

export interface CategoryInfo {
  slug: string;
  name: string;
  bn: string;
  match: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: "honey", name: "Pure Honey", bn: "খাঁটি মধু", match: ["honey"] },
  { slug: "oil", name: "Premium Oils", bn: "প্রিমিয়াম তেল", match: ["oil", "oils"] },
  { slug: "dates", name: "Dates", bn: "খেজুর", match: ["dates", "date"] },
  { slug: "nuts", name: "Organic Nuts", bn: "অর্গানিক বাদাম", match: ["nuts", "nut"] },
  { slug: "seeds", name: "Healthy Seeds", bn: "স্বাস্থ্যকর বীজ", match: ["seeds", "seed"] },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
