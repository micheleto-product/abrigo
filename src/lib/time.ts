import { useEffect, useState } from "react";

/** Hora atual, só depois de montar no navegador (evita divergência com o servidor). */
export function useNow(intervalMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function relativeTime(iso: string, now: Date | null): string {
  if (!iso || !now) return "Atualizado hoje";
  const min = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Atualizado agora";
  if (min < 60) return `Atualizado há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Atualizado há ${h}h`;
  return "Atualizado há mais de um dia";
}
