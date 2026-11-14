import { Search, X } from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import type { PlaceFilters } from "@/lib/filter";
import { cn } from "@/lib/utils";

export const DISTANCES: { km: number | null; label: string }[] = [
  { km: null, label: "Qualquer distância" },
  { km: 1, label: "Até 1 km" },
  { km: 3, label: "Até 3 km" },
  { km: 5, label: "Até 5 km" },
];

interface Props {
  filters: PlaceFilters;
  onChange: (f: PlaceFilters) => void;
}

export function SearchBar({ filters, onChange }: Props) {
  return (
    <div className="relative flex-1">
      <label htmlFor="busca" className="sr-only">
        Buscar local, bairro ou tipo de ajuda
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        id="busca"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder="Buscar: sopa, banho, Sé…"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        className="h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-12 text-lg text-foreground shadow-float placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
      />
      {filters.query && (
        <button
          type="button"
          onClick={() => onChange({ ...filters, query: "" })}
          className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          aria-label="Limpar busca"
        >
          <X className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function CategoryChips({ filters, onChange, wrap }: Props & { wrap?: boolean }) {
  const toggle = (id: CategoryId) => {
    const has = filters.categories.includes(id);
    onChange({ ...filters, categories: has ? filters.categories.filter((c) => c !== id) : [...filters.categories, id] });
  };
  const all = filters.categories.length === 0;
  return (
    <div
      role="group"
      aria-label="Tipo de ajuda"
      className={cn("flex gap-2", wrap ? "flex-wrap" : "no-scrollbar -mx-3 overflow-x-auto px-3")}
    >
      <button
        type="button"
        aria-pressed={all}
        onClick={() => onChange({ ...filters, categories: [] })}
        className={cn(
          "flex h-12 shrink-0 items-center rounded-full border-2 px-5 text-base font-bold shadow-card transition-colors",
          all ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground",
        )}
      >
        Tudo
      </button>
      {CATEGORIES.map((c) => {
        const active = filters.categories.includes(c.id);
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(c.id)}
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 rounded-full border-2 pl-1.5 pr-4 text-base font-bold shadow-card transition-colors",
              active ? cn("border-transparent", c.solid) : "border-border bg-card text-foreground",
            )}
          >
            <span
              className={cn("grid h-9 w-9 place-items-center rounded-full", active ? "bg-on-cat/20" : c.solid)}
              aria-hidden
            >
              <Icon className="size-5" strokeWidth={2.4} />
            </span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

export function SecondaryFilters({ filters, onChange, wrap }: Props & { wrap?: boolean }) {
  const chip = (active: boolean) =>
    cn(
      "flex h-10 shrink-0 items-center rounded-full border-2 px-4 text-sm font-bold transition-colors",
      active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground",
    );
  return (
    <div
      role="group"
      aria-label="Filtros de horário e distância"
      className={cn("flex gap-2", wrap ? "flex-wrap" : "no-scrollbar -mx-3 overflow-x-auto px-3")}
    >
      <button
        type="button"
        aria-pressed={filters.openNow}
        onClick={() => onChange({ ...filters, openNow: !filters.openNow })}
        className={chip(filters.openNow)}
      >
        Aberto agora
      </button>
      {DISTANCES.slice(1).map((d) => (
        <button
          key={d.label}
          type="button"
          aria-pressed={filters.maxKm === d.km}
          onClick={() => onChange({ ...filters, maxKm: filters.maxKm === d.km ? null : d.km })}
          className={chip(filters.maxKm === d.km)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
