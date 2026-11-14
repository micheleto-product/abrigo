import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, List, LocateFixed, Map as MapIcon, MapPinOff } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CategoryChips, SearchBar, SecondaryFilters } from "@/components/abrigo/filters";
import { LogoMark } from "@/components/abrigo/Logo";
import type { MapFocus } from "@/components/abrigo/MapView";
import { PlaceDetails, PlaceListItem } from "@/components/abrigo/places-ui";
import { SponsorStrip } from "@/components/abrigo/SiteFooter";
import { SpeakButton } from "@/components/abrigo/SpeakButton";
import { Button } from "@/components/ui/button";
import { filterPlaces, type PlaceFilters } from "@/lib/filter";
import { DEFAULT_CENTER, distanceKm, type LatLng } from "@/lib/geo";
import { mergePlaces, usePartnerStore } from "@/lib/partner-store";
import { DEMO_PLACES } from "@/lib/places";
import { useNow } from "@/lib/time";

const MapView = lazy(() => import("@/components/abrigo/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Abrigo — Comida, abrigo, roupas e saúde perto de você" },
      {
        name: "description",
        content:
          "Mapa gratuito com sopões, restaurantes populares, abrigos, roupas, banho e postos de saúde perto de você. Simples, com leitura em voz.",
      },
      { property: "og:title", content: "Abrigo — Ajuda gratuita perto de você" },
      {
        property: "og:description",
        content: "Encontre comida, abrigo, roupas, banho e saúde gratuitos no mapa, com horários e vagas em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

type LocStatus = "locating" | "ok" | "far" | "denied" | "unsupported";
const FAR_KM = 60;

const INITIAL_FILTERS: PlaceFilters = { query: "", categories: [], maxKm: null, openNow: false };

function MapPage() {
  const now = useNow();
  const store = usePartnerStore();
  const allPlaces = useMemo(() => mergePlaces(DEMO_PLACES, store), [store]);

  const [filters, setFilters] = useState<PlaceFilters>(INITIAL_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileList, setMobileList] = useState(false);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [user, setUser] = useState<LatLng | null>(null);
  const [locStatus, setLocStatus] = useState<LocStatus>("locating");
  const topRef = useRef<HTMLDivElement>(null);
  const [topH, setTopH] = useState(180);

  const origin = locStatus === "ok" && user ? user : DEFAULT_CENTER;
  const results = useMemo(() => filterPlaces(allPlaces, origin, filters, now), [allPlaces, origin, filters, now]);
  const selected = useMemo(
    () => (selectedId ? filterPlaces(allPlaces, origin, INITIAL_FILTERS, now).find((p) => p.id === selectedId) ?? null : null),
    [selectedId, allPlaces, origin, now],
  );

  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTopH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocStatus("unsupported");
      return;
    }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUser(here);
        const far = distanceKm(here, DEFAULT_CENTER) > FAR_KM;
        setLocStatus(far ? "far" : "ok");
        setFocus({ ...(far ? DEFAULT_CENTER : here), zoom: 15, key: Date.now() });
      },
      () => setLocStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 },
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) return;
      setMobileList(false);
      const p = allPlaces.find((x) => x.id === id);
      if (p) setFocus({ lat: p.lat, lng: p.lng, zoom: 16, key: Date.now(), offsetY: isDesktop() ? 0 : 150 });
    },
    [allPlaces],
  );

  const introSpeech = `Bem-vindo ao Abrigo. Aqui você encontra comida, lugar para dormir, roupas, banho e saúde de graça perto de você. Toque em um tipo de ajuda e depois em um ponto do mapa. Agora há ${results.length} locais na lista. O mais perto é ${results[0]?.name ?? "nenhum"}.`;

  const locationNotice = <LocationNotice status={locStatus} onLocate={locate} />;

  const list = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? "local encontrado" : "locais encontrados"}
        </p>
        {(filters.categories.length > 0 || filters.maxKm || filters.openNow || filters.query) && (
          <button
            type="button"
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="text-sm font-bold text-accent underline underline-offset-4"
          >
            Limpar filtros
          </button>
        )}
      </div>
      {results.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
          <p className="font-display text-xl font-bold">Nada encontrado aqui</p>
          <p className="mt-1 text-muted-foreground">Tente outra palavra ou aumente a distância.</p>
          <Button variant="ink" size="touch" className="mt-4" onClick={() => setFilters(INITIAL_FILTERS)}>
            Ver todos os locais
          </Button>
        </div>
      ) : (
        results.map((p) => <PlaceListItem key={p.id} place={p} now={now} onSelect={select} />)
      )}
      <SponsorStrip className="pt-4" />
    </div>
  );

  return (
    <div className="map-viewport overflow-hidden">
      <h1 className="sr-only">Ajuda gratuita perto de você</h1>

      {/* Map */}
      <div className="absolute inset-0 md:left-[440px]">
        <ClientOnly fallback={<MapSkeleton />}>
          <Suspense fallback={<MapSkeleton />}>
            <MapView places={results} selectedId={selectedId} onSelect={select} user={user} focus={focus} />
          </Suspense>
        </ClientOnly>
      </div>

      {/* Mobile: top search + filters */}
      <div ref={topRef} className="pointer-events-none absolute inset-x-0 top-0 z-[1000] md:hidden">
        <div className="pointer-events-auto flex flex-col gap-2.5 bg-gradient-to-b from-background via-background/90 to-transparent px-3 pb-4 pt-3">
          <div className="flex items-center gap-2">
            <LogoMark className="h-12 w-12 shrink-0" />
            <SearchBar filters={filters} onChange={setFilters} />
            <SpeakButton text={introSpeech} compact variant="floating" />
          </div>
          <CategoryChips filters={filters} onChange={setFilters} />
          <SecondaryFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Mobile: list overlay */}
      {mobileList && !selected && (
        <div
          className="absolute inset-x-0 bottom-0 z-[990] overflow-y-auto bg-background px-3 pb-28 md:hidden"
          style={{ top: topH - 12 }}
        >
          <div className="pt-3">{locationNotice}</div>
          <div className="pt-3">{list}</div>
        </div>
      )}

      {/* Mobile: floating actions */}
      {!selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[1000] flex items-end justify-between gap-3 px-3 md:hidden">
          <div className="w-14" />
          <Button
            variant="ink"
            size="xl"
            className="pointer-events-auto rounded-full px-7"
            onClick={() => setMobileList((v) => !v)}
            aria-pressed={mobileList}
          >
            {mobileList ? <MapIcon aria-hidden /> : <List aria-hidden />}
            {mobileList ? "Ver mapa" : `Ver lista (${results.length})`}
          </Button>
          <Button
            variant="floating"
            size="iconLg"
            className="pointer-events-auto rounded-full"
            onClick={locate}
            aria-label="Mostrar onde estou"
          >
            <LocateFixed aria-hidden className={locStatus === "locating" ? "animate-pulse" : ""} />
          </Button>
        </div>
      )}

      {/* Mobile: selected place sheet */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-[1050] max-h-[72%] overflow-y-auto rounded-t-3xl border-t-2 border-border bg-card px-4 pb-5 pt-2 shadow-float animate-sheet-up md:hidden">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" aria-hidden />
          <PlaceDetails place={selected} now={now} onClose={() => setSelectedId(null)} />
        </div>
      )}

      {/* Desktop side panel */}
      <aside className="absolute inset-y-0 left-0 z-[1000] hidden w-[440px] flex-col border-r-2 border-border bg-background md:flex">
        {selected ? (
          <div className="flex-1 overflow-y-auto p-6">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-4 inline-flex h-11 items-center gap-2 rounded-xl px-2 font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-5" aria-hidden /> Voltar para a lista
            </button>
            <PlaceDetails place={selected} now={now} onClose={() => setSelectedId(null)} />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b-2 border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-3xl font-extrabold">Ajuda perto de você</p>
                  <p className="text-muted-foreground">Comida, abrigo, roupas e saúde de graça.</p>
                </div>
                <SpeakButton text={introSpeech} compact />
              </div>
              <SearchBar filters={filters} onChange={setFilters} />
              <CategoryChips filters={filters} onChange={setFilters} wrap />
              <SecondaryFilters filters={filters} onChange={setFilters} wrap />
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4">{locationNotice}</div>
              {list}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-muted">
      <p className="font-bold text-muted-foreground">Carregando o mapa…</p>
    </div>
  );
}

function LocationNotice({ status, onLocate }: { status: LocStatus; onLocate: () => void }) {
  if (status === "ok") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-success-soft px-4 py-3 font-bold text-success">
        <LocateFixed className="size-5" aria-hidden /> Mostrando os locais mais perto de você
      </p>
    );
  }
  if (status === "locating") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 font-bold text-muted-foreground">
        <LocateFixed className="size-5 animate-pulse" aria-hidden /> Procurando onde você está…
      </p>
    );
  }
  const text =
    status === "far"
      ? "Você está longe dos locais de demonstração. Mostrando o centro de São Paulo."
      : "Não conseguimos ver onde você está. Mostrando o centro de São Paulo.";
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-warning-soft px-4 py-3">
      <MapPinOff className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
      <div className="flex-1">
        <p className="font-bold text-foreground">{text}</p>
        {status !== "far" && (
          <button type="button" onClick={onLocate} className="mt-1 font-bold text-accent underline underline-offset-4">
            Tentar de novo
          </button>
        )}
      </div>
    </div>
  );
}
