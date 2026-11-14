import L from "leaflet";
import { useEffect, useRef } from "react";
import type { LatLng } from "@/lib/geo";

interface Props {
  value: LatLng;
  onChange: (p: LatLng) => void;
  recenterKey?: number;
}

/** Mapa pequeno: toque para marcar onde fica o ponto de doação. */
export default function LocationPicker({ value, onChange, recenterKey }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, { center: [value.lat, value.lng], zoom: 15, zoomControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);
    const icon = L.divIcon({
      className: "abrigo-pin",
      html: '<div class="abrigo-pin__body pin-alimentos"></div>',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    });
    markerRef.current = L.marker([value.lat, value.lng], { icon, draggable: true }).addTo(map);
    markerRef.current.on("dragend", () => {
      const ll = markerRef.current!.getLatLng();
      onChangeRef.current({ lat: ll.lat, lng: ll.lng });
    });
    map.on("click", (e: L.LeafletMouseEvent) => {
      markerRef.current?.setLatLng(e.latlng);
      onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    mapRef.current = map;
    return () => {
      map.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!recenterKey || !mapRef.current) return;
    markerRef.current?.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], 16);
  }, [recenterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={elRef}
      className="h-64 w-full overflow-hidden rounded-2xl border-2 border-border"
      aria-label="Toque no mapa para marcar o local"
    />
  );
}
