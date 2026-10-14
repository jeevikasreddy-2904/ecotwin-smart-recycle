import { Milk, Newspaper, Wine, Cylinder, Apple, Cpu, Shirt, TriangleAlert, Trash2, HelpCircle, type LucideIcon } from "lucide-react";

export const CATEGORIES = ["plastic", "paper", "glass", "metal", "organic", "ewaste", "textile", "hazardous", "general", "unknown"] as const;
export type Category = (typeof CATEGORIES)[number];
export const BIN_CATEGORIES = CATEGORIES.filter((c) => c !== "unknown") as Exclude<Category, "unknown">[];

export const BIN_CAPACITY = 10;
export const WARN_RATIO = 0.8;

type Meta = { label: string; icon: LucideIcon; text: string; bg: string; border: string; fill: string; color: string };

export const CAT: Record<Category, Meta> = {
  plastic: { label: "Plastic", icon: Milk, text: "text-cat-plastic", bg: "bg-cat-plastic/15", border: "border-cat-plastic/40", fill: "bg-cat-plastic", color: "var(--cat-plastic)" },
  paper: { label: "Paper & Cardboard", icon: Newspaper, text: "text-cat-paper", bg: "bg-cat-paper/15", border: "border-cat-paper/40", fill: "bg-cat-paper", color: "var(--cat-paper)" },
  glass: { label: "Glass", icon: Wine, text: "text-cat-glass", bg: "bg-cat-glass/15", border: "border-cat-glass/40", fill: "bg-cat-glass", color: "var(--cat-glass)" },
  metal: { label: "Metal", icon: Cylinder, text: "text-cat-metal", bg: "bg-cat-metal/15", border: "border-cat-metal/40", fill: "bg-cat-metal", color: "var(--cat-metal)" },
  organic: { label: "Organic", icon: Apple, text: "text-cat-organic", bg: "bg-cat-organic/15", border: "border-cat-organic/40", fill: "bg-cat-organic", color: "var(--cat-organic)" },
  ewaste: { label: "E-waste", icon: Cpu, text: "text-cat-ewaste", bg: "bg-cat-ewaste/15", border: "border-cat-ewaste/40", fill: "bg-cat-ewaste", color: "var(--cat-ewaste)" },
  textile: { label: "Textile", icon: Shirt, text: "text-cat-textile", bg: "bg-cat-textile/15", border: "border-cat-textile/40", fill: "bg-cat-textile", color: "var(--cat-textile)" },
  hazardous: { label: "Special Disposal", icon: TriangleAlert, text: "text-cat-hazardous", bg: "bg-cat-hazardous/15", border: "border-cat-hazardous/40", fill: "bg-cat-hazardous", color: "var(--cat-hazardous)" },
  general: { label: "General Waste", icon: Trash2, text: "text-cat-general", bg: "bg-cat-general/15", border: "border-cat-general/40", fill: "bg-cat-general", color: "var(--cat-general)" },
  unknown: { label: "Unknown", icon: HelpCircle, text: "text-cat-unknown", bg: "bg-cat-unknown/15", border: "border-cat-unknown/40", fill: "bg-cat-unknown", color: "var(--cat-unknown)" },
};

/** General, non-local guidance. Always verify with local rules. */
export const GUIDE: Record<Category, { reuse: string[]; recycle: string[]; prepare: string[]; special: string[] }> = {
  plastic: {
    reuse: ["Refill sturdy bottles and containers for storage.", "Use tubs as seed starters or organisers."],
    recycle: ["Rigid bottles and tubs are widely accepted — check the resin code your area takes.", "Soft films and bags often need separate store drop-off."],
    prepare: ["Empty and quickly rinse.", "Replace or remove caps as your local scheme asks.", "Do not bag recyclables unless told to."],
    special: [],
  },
  paper: {
    reuse: ["Reuse boxes for shipping or storage.", "Use scrap paper for notes."],
    recycle: ["Clean, dry paper and flattened cardboard are widely accepted."],
    prepare: ["Flatten boxes.", "Remove tape and food residue.", "Greasy or wet paper usually belongs in compost or general waste."],
    special: [],
  },
  glass: {
    reuse: ["Jars make great food storage or planters."],
    recycle: ["Bottles and jars are widely recyclable; window glass, mirrors and ceramics usually are not."],
    prepare: ["Empty and rinse.", "Remove lids (often recycled as metal)."],
    special: ["Wrap broken glass before disposal to protect handlers."],
  },
  metal: {
    reuse: ["Clean tins work as pen pots or planters."],
    recycle: ["Aluminium and steel cans are highly recyclable in most areas."],
    prepare: ["Empty and rinse.", "Fully empty aerosols before recycling, if accepted locally."],
    special: ["Gas canisters and pressurised containers need special handling."],
  },
  organic: {
    reuse: ["Use peels and scraps for stock, or regrow cuttings."],
    recycle: ["Home compost or a municipal food/garden waste collection."],
    prepare: ["Remove stickers, plastic packaging and ties."],
    special: [],
  },
  ewaste: {
    reuse: ["Repair, resell or donate working devices.", "Wipe personal data first."],
    recycle: ["Take to an e-waste collection point or retailer take-back scheme."],
    prepare: ["Remove batteries where safe and dispose of them separately."],
    special: ["Never put electronics or batteries in household bins — fire risk."],
  },
  textile: {
    reuse: ["Donate wearable clothing.", "Repurpose worn fabric as cleaning rags."],
    recycle: ["Use textile banks or take-back programmes."],
    prepare: ["Wash and dry items; bag them to keep them clean."],
    special: [],
  },
  hazardous: {
    reuse: [],
    recycle: [],
    prepare: ["Keep in original container with the label visible.", "Do not mix chemicals."],
    special: ["Take to a household hazardous waste site or official collection day.", "Batteries, paint, chemicals, medicines and fluorescent bulbs need special disposal."],
  },
  general: {
    reuse: ["Check whether parts of the item can be separated and reused."],
    recycle: [],
    prepare: ["Separate any recyclable components first."],
    special: [],
  },
  unknown: {
    reuse: [],
    recycle: [],
    prepare: ["Take a clearer photo of a single item in good light."],
    special: ["When unsure, check your local council's waste guide rather than guessing."],
  },
};

export const COMMON_ITEMS: { name: string; cat: Category }[] = [
  { name: "Plastic water bottle", cat: "plastic" }, { name: "Yoghurt pot", cat: "plastic" }, { name: "Plastic bag / film", cat: "plastic" },
  { name: "Cardboard box", cat: "paper" }, { name: "Newspaper", cat: "paper" }, { name: "Pizza box (greasy)", cat: "general" },
  { name: "Glass jar", cat: "glass" }, { name: "Wine bottle", cat: "glass" }, { name: "Drinking glass (broken)", cat: "general" },
  { name: "Aluminium can", cat: "metal" }, { name: "Food tin", cat: "metal" }, { name: "Aerosol can", cat: "metal" },
  { name: "Banana peel", cat: "organic" }, { name: "Coffee grounds", cat: "organic" }, { name: "Garden leaves", cat: "organic" },
  { name: "Old phone", cat: "ewaste" }, { name: "Charger cable", cat: "ewaste" }, { name: "Laptop", cat: "ewaste" },
  { name: "T-shirt", cat: "textile" }, { name: "Old shoes", cat: "textile" },
  { name: "AA battery", cat: "hazardous" }, { name: "Paint tin", cat: "hazardous" }, { name: "Medicine", cat: "hazardous" }, { name: "Light bulb (CFL)", cat: "hazardous" },
  { name: "Crisp packet", cat: "general" }, { name: "Nappy", cat: "general" },
];
