import { BadgeCheck, Clock, MapPin, Navigation, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_BY_ID, type CategoryId } from "@/lib/categories";
import type { PlaceWithDistance } from "@/lib/filter";
import { directionsUrl, formatDistance, walkingMinutes } from "@/lib/geo";
import { nextOpeningText } from "@/lib/hours";
import type { Capacity } from "@/lib/places";
import { relativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { SpeakButton } from "./SpeakButton";

export function CategoryIcon({ id, size = "md" }: { id: CategoryId; size?: "sm" | "md" | "lg" }) {
  const cat = CATEGORY_BY_ID[id];
  const Icon = cat.icon;
  const dims = { sm: "h-9 w-9 [&_svg]:size-5", md: "h-12 w-12 [&_svg]:size-6", lg: "h-14 w-14 [&_svg]:size-7" }[size];
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-2xl", cat.solid, dims)} aria-hidden>
      <Icon strokeWidth={2.4} />
    </span>
  );
}

export function OpenBadge({ place, now }: { place: PlaceWithDistance; now: Date | null }) {
  if (place.openNow === null || !now) return null;
  if (place.openNow) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
        <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden />
        Aberto agora
      </span>
    );
  }
  const next = nextOpeningText(place.schedules, now);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" aria-hidden />
      Fechado{next ? ` · ${next}` : ""}
    </span>
  );
}

export function CapacityMeter({ capacity, now, compact }: { capacity: Capacity; now: Date | null; compact?: boolean }) {
  const pct = capacity.total ? Math.min(100, (capacity.available / capacity.total) * 100) : 0;
  const full = capacity.available <= 0;
  const low = !full && pct < 15;
  if (compact) {
    return (
      <span className={cn("text-sm font-bold", full ? "text-destructive" : low ? "text-warning" : "text-success")}>
        {full ? "Lotado agora" : `${capacity.available} disponíveis`}
      </span>
    );
  }
  return (
    <div className={cn("rounded-2xl border-2 p-4", full ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold text-muted-foreground">{capacity.label}</span>
        <span className="text-xs text-muted-foreground">{relativeTime(capacity.updatedAt, now)}</span>
      </div>
      <p className={cn("mt-1 font-display text-3xl font-extrabold", full ? "text-destructive" : low ? "text-warning" : "text-success")}>
        {full ? "Lotado agora" : capacity.available}
        {!full && <span className="ml-2 text-base font-bold text-muted-foreground">de {capacity.total}</span>}
      </p>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-card"
        role="progressbar"
        aria-valuenow={capacity.available}
        aria-valuemin={0}
        aria-valuemax={capacity.total}
        aria-label={capacity.label}
      >
        <div
          className={cn("h-full rounded-full", full ? "bg-destructive" : low ? "bg-warning" : "bg-success")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PlaceListItem({
  place,
  now,
  onSelect,
}: {
  place: PlaceWithDistance;
  now: Date | null;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className="flex w-full items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left shadow-card transition-colors hover:border-foreground/30 active:bg-muted"
    >
      <CategoryIcon id={place.category} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-muted-foreground">{place.kind}</span>
        <span className="block font-display text-lg font-bold leading-snug text-foreground">{place.name}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-bold text-foreground">
            {formatDistance(place.distanceKm)}
            <span className="font-normal text-muted-foreground"> · {walkingMinutes(place.distanceKm)} min a pé</span>
          </span>
          {place.capacity && <CapacityMeter capacity={place.capacity} now={now} compact />}
        </span>
        <span className="mt-2 block">
          <OpenBadge place={place} now={now} />
        </span>
      </span>
    </button>
  );
}

function speechFor(place: PlaceWithDistance, now: Date | null) {
  const status = place.openNow === null ? "" : place.openNow ? "Está aberto agora." : `Está fechado agora. ${nextOpeningText(place.schedules, now ?? new Date()) ?? ""}.`;
  const cap = place.capacity
    ? place.capacity.available > 0
      ? `${place.capacity.label}: ${place.capacity.available}.`
      : "Está lotado agora."
    : "";
  return [
    `${place.name}. ${place.kind}.`,
    status,
    `Fica a ${formatDistance(place.distanceKm).replace("km", "quilômetros").replace(" m", " metros")}, cerca de ${walkingMinutes(place.distanceKm)} minutos a pé.`,
    `Endereço: ${place.address}.`,
    `Horário: ${place.hoursText.replace(/·/g, ",")}.`,
    cap,
    `O que precisa: ${place.requirements}`,
  ].join(" ");
}

export function PlaceDetails({
  place,
  now,
  onClose,
  className,
}: {
  place: PlaceWithDistance;
  now: Date | null;
  onClose: () => void;
  className?: string;
}) {
  const cat = CATEGORY_BY_ID[place.category];
  return (
    <article className={cn("flex flex-col gap-4", className)} aria-labelledby={`place-${place.id}`}>
      <header className="flex items-start gap-3">
        <CategoryIcon id={place.category} size="lg" />
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-bold", cat.text)}>
            {cat.label} · {place.kind}
          </p>
          <h2 id={`place-${place.id}`} className="font-display text-2xl font-extrabold text-foreground">
            {place.name}
          </h2>
        </div>
        <Button variant="soft" size="iconLg" onClick={onClose} aria-label="Fechar">
          <X aria-hidden />
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <OpenBadge place={place} now={now} />
        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
          {formatDistance(place.distanceKm)} · {walkingMinutes(place.distanceKm)} min a pé
        </span>
      </div>

      {place.capacity && <CapacityMeter capacity={place.capacity} now={now} />}

      <dl className="flex flex-col gap-3">
        <InfoRow icon={MapPin} label="Endereço">{place.address}</InfoRow>
        <InfoRow icon={Clock} label="Horário">{place.hoursText}</InfoRow>
        <InfoRow icon={BadgeCheck} label="O que precisa">{place.requirements}</InfoRow>
      </dl>

      <p className="text-muted-foreground">{place.description}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <Button asChild variant="hero" size="xl" className="w-full">
          <a href={directionsUrl(place)} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden />
            Como chegar
          </a>
        </Button>
        <div className="flex gap-2">
          {place.phone && (
            <Button asChild variant="ink" size="xl" className="flex-1">
              <a href={`tel:${place.phone}`} aria-label={`Ligar para ${place.phone}`}>
                <Phone aria-hidden />
                {place.phone}
              </a>
            </Button>
          )}
          <SpeakButton text={speechFor(place, now)} size="xl" className="flex-1" />
        </div>
      </div>

      {place.sponsor && (
        <p className="text-sm text-muted-foreground">
          <span aria-hidden>★ </span>Ponto apoiado por <strong className="text-foreground">{place.sponsor}</strong>
        </p>
      )}
      {place.source === "parceiro" && (
        <p className="text-sm text-muted-foreground">Cadastrado por um parceiro neste aparelho.</p>
      )}
    </article>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-6 shrink-0 text-foreground" aria-hidden />
      <div>
        <dt className="text-sm font-bold text-muted-foreground">{label}</dt>
        <dd className="text-lg leading-snug text-foreground">{children}</dd>
      </div>
    </div>
  );
}
