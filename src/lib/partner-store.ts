import { useSyncExternalStore } from "react";
import type { Capacity, Place } from "./places";

/**
 * Armazenamento local (neste aparelho) dos pontos cadastrados por parceiros
 * e das atualizações de disponibilidade feitas no painel.
 */
const POINTS_KEY = "abrigo:pontos-parceiros";
const CAPACITY_KEY = "abrigo:disponibilidade";

type CapacityOverrides = Record<string, Capacity>;

interface StoreState {
  points: Place[];
  capacity: CapacityOverrides;
}

const EMPTY: StoreState = { points: [], capacity: {} };
let state: StoreState | null = null;
const listeners = new Set<() => void>();

function read(): StoreState {
  if (typeof window === "undefined") return EMPTY;
  if (state) return state;
  try {
    state = {
      points: JSON.parse(localStorage.getItem(POINTS_KEY) ?? "[]"),
      capacity: JSON.parse(localStorage.getItem(CAPACITY_KEY) ?? "{}"),
    };
  } catch {
    state = { points: [], capacity: {} };
  }
  return state;
}

function write(next: StoreState) {
  state = next;
  try {
    localStorage.setItem(POINTS_KEY, JSON.stringify(next.points));
    localStorage.setItem(CAPACITY_KEY, JSON.stringify(next.capacity));
  } catch {
    /* armazenamento cheio ou bloqueado */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePartnerStore(): StoreState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addPartnerPoint(place: Place) {
  const s = read();
  write({ ...s, points: [place, ...s.points] });
}

export function removePartnerPoint(id: string) {
  const s = read();
  const capacity = { ...s.capacity };
  delete capacity[id];
  write({ points: s.points.filter((p) => p.id !== id), capacity });
}

export function updateCapacity(id: string, capacity: Capacity) {
  const s = read();
  write({ ...s, capacity: { ...s.capacity, [id]: capacity } });
}

/** Junta pontos de demonstração + parceiros, aplicando as vagas atualizadas. */
export function mergePlaces(demo: Place[], store: StoreState): Place[] {
  return [...store.points, ...demo].map((p) =>
    store.capacity[p.id] ? { ...p, capacity: store.capacity[p.id] } : p,
  );
}
