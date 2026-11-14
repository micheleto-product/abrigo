import type { CategoryId } from "./categories";
import { distanceKm, type LatLng } from "./geo";
import { isOpenAt } from "./hours";
import type { Place } from "./places";

export interface PlaceFilters {
  query: string;
  categories: CategoryId[]; // vazio = todas
  maxKm: number | null; // null = qualquer distância
  openNow: boolean;
}

export interface PlaceWithDistance extends Place {
  distanceKm: number;
  openNow: boolean | null; // null antes de saber a hora (SSR)
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function filterPlaces(
  places: Place[],
  origin: LatLng,
  filters: PlaceFilters,
  now: Date | null,
): PlaceWithDistance[] {
  const q = normalize(filters.query.trim());
  return places
    .map((p) => ({
      ...p,
      distanceKm: distanceKm(origin, p),
      openNow: now ? isOpenAt(p.schedules, now) : null,
    }))
    .filter((p) => filters.categories.length === 0 || filters.categories.includes(p.category))
    .filter((p) => filters.maxKm === null || p.distanceKm <= filters.maxKm)
    .filter((p) => !filters.openNow || p.openNow !== false)
    .filter(
      (p) =>
        !q ||
        normalize(`${p.name} ${p.kind} ${p.neighborhood} ${p.address} ${p.description}`).includes(q),
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
