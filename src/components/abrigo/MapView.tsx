import L from "leaflet";
import { useEffect, useRef } from "react";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { DEFAULT_CENTER, type LatLng } from "@/lib/geo";
import type { Place } from "@/lib/places";

export interface MapFocus extends LatLng {
  key: number;
  zoom?: number;
  /** desloca o centro para cima (px) quando um cartão cobre a parte de baixo */
  offsetY?: number;
}

interface Props {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  user: LatLng | null;
  focus: MapFocus | null;
}

const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function pinIcon(place: Place, selected: boolean) {
  const cat = CATEGORY_BY_ID[place.category];
  return L.divIcon({
    className: `abrigo-pin${selected ? " abrigo-pin--selected" : ""}`,
    html: `<div class="abrigo-pin__body pin-${place.category}">${cat.svg}</div>${
      place.sponsor ? '<span class="abrigo-pin__star" aria-hidden="true">★</span>' : ""
    }`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
}

export default function MapView({ places, selectedId, onSelect, user, focus }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const meRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false,
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 14,
      minZoom: 4,
      maxZoom: 19,
    });
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, subdomains: "abcd", maxZoom: 19 }).addTo(map);
    if (window.matchMedia("(min-width: 768px)").matches) {
      L.control.zoom({ position: "bottomright", zoomInTitle: "Aproximar", zoomOutTitle: "Afastar" }).addTo(map);
    }
    map.on("click", () => onSelectRef.current(null));
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const p of places) {
      const selected = p.id === selectedId;
      const marker = L.marker([p.lat, p.lng], {
        icon: pinIcon(p, selected),
        title: p.name,
        alt: `${CATEGORY_BY_ID[p.category].label}: ${p.name}`,
        keyboard: true,
        riseOnHover: true,
        zIndexOffset: selected ? 1000 : 0,
      });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current(p.id);
      });
      marker.on("keypress", (e) => {
        const key = (e as L.LeafletKeyboardEvent).originalEvent.key;
        if (key === "Enter" || key === " ") onSelectRef.current(p.id);
      });
      layer.addLayer(marker);
    }
  }, [places, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!user) {
      meRef.current?.remove();
      meRef.current = null;
      return;
    }
    if (!meRef.current) {
      meRef.current = L.marker([user.lat, user.lng], {
        icon: L.divIcon({ className: "abrigo-me", html: '<div class="abrigo-me__dot"></div>', iconSize: [22, 22] }),
        title: "Você está aqui",
        interactive: false,
        zIndexOffset: -100,
      }).addTo(map);
    } else {
      meRef.current.setLatLng([user.lat, user.lng]);
    }
  }, [user]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    const zoom = focus.zoom ?? Math.max(map.getZoom(), 15);
    let target = L.latLng(focus.lat, focus.lng);
    if (focus.offsetY) {
      const pt = map.project(target, zoom).add([0, focus.offsetY]);
      target = map.unproject(pt, zoom);
    }
    map.flyTo(target, zoom, { duration: 0.6 });
  }, [focus?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={elRef} className="h-full w-full" role="application" aria-label="Mapa de locais de ajuda" />;
}
