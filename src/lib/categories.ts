import { HeartPulse, House, Shirt, Utensils, type LucideIcon } from "lucide-react";

export type CategoryId = "alimentos" | "abrigos" | "roupas" | "saude";

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
  examples: string;
  icon: LucideIcon;
  /** Tailwind classes built on design tokens */
  solid: string;
  soft: string;
  text: string;
  /** Raw SVG markup for Leaflet pins (Lucide paths) */
  svg: string;
}

const svg = (paths: string[]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths
    .map((d) => `<path d="${d}"/>`)
    .join("")}</svg>`;

export const CATEGORIES: Category[] = [
  {
    id: "alimentos",
    label: "Comida",
    short: "Comida",
    examples: "Sopões, restaurantes populares, cozinhas solidárias e cestas básicas",
    icon: Utensils,
    solid: "bg-cat-food text-on-cat",
    soft: "bg-cat-food-soft text-cat-food",
    text: "text-cat-food",
    svg: svg([
      "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",
      "M7 2v20",
      "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
    ]),
  },
  {
    id: "abrigos",
    label: "Abrigo",
    short: "Dormir",
    examples: "Albergues, casas de acolhida e vagas noturnas",
    icon: House,
    solid: "bg-cat-shelter text-on-cat",
    soft: "bg-cat-shelter-soft text-cat-shelter",
    text: "text-cat-shelter",
    svg: svg([
      "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
      "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    ]),
  },
  {
    id: "roupas",
    label: "Roupas",
    short: "Roupas",
    examples: "Roupas, calçados e cobertores",
    icon: Shirt,
    solid: "bg-cat-clothes text-on-cat",
    soft: "bg-cat-clothes-soft text-cat-clothes",
    text: "text-cat-clothes",
    svg: svg([
      "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z",
    ]),
  },
  {
    id: "saude",
    label: "Saúde e banho",
    short: "Saúde",
    examples: "Banho, postos de saúde e kits de higiene",
    icon: HeartPulse,
    solid: "bg-cat-health text-on-cat",
    soft: "bg-cat-health-soft text-cat-health",
    text: "text-cat-health",
    svg: svg([
      "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
      "M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",
    ]),
  },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
