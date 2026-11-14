export interface Schedule {
  /** 0 = domingo ... 6 = sábado */
  days: number[];
  open: string; // "HH:MM"
  close: string; // "HH:MM" (pode passar da meia-noite, ex: 19:00 → 07:00)
  label?: string;
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Está aberto neste momento? Suporta turnos que atravessam a meia-noite. */
export function isOpenAt(schedules: Schedule[], date: Date): boolean {
  const day = date.getDay();
  const now = date.getHours() * 60 + date.getMinutes();
  const yesterday = (day + 6) % 7;
  return schedules.some((s) => {
    const o = toMin(s.open);
    const c = toMin(s.close);
    if (o === c) return s.days.includes(day); // 24h
    if (c > o) return s.days.includes(day) && now >= o && now < c;
    // overnight shift
    return (s.days.includes(day) && now >= o) || (s.days.includes(yesterday) && now < c);
  });
}

const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** Texto curto da próxima abertura, ex: "Abre hoje às 18h" ou "Abre segunda às 7h". */
export function nextOpeningText(schedules: Schedule[], date: Date): string | null {
  for (let offset = 0; offset < 8; offset++) {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    const day = d.getDay();
    const now = offset === 0 ? date.getHours() * 60 + date.getMinutes() : -1;
    const opens = schedules
      .filter((s) => s.days.includes(day))
      .map((s) => toMin(s.open))
      .filter((m) => m > now)
      .sort((a, b) => a - b);
    if (opens.length) {
      const m = opens[0];
      const time = `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
      const when = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : DAY_NAMES[day];
      return `Abre ${when} às ${time}`;
    }
  }
  return null;
}

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS = [1, 2, 3, 4, 5];
export const MON_SAT = [1, 2, 3, 4, 5, 6];
