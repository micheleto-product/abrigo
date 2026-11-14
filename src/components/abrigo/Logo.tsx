import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-10 w-10", className)} aria-hidden="true">
      <rect width="48" height="48" rx="13" className="fill-primary" />
      <path
        d="M11 23 24 12.5 37 23M15.5 20v14.5M32.5 20v14.5"
        className="stroke-accent"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 33.5s-6-3.7-6-7.7a3.2 3.2 0 0 1 6-1.6 3.2 3.2 0 0 1 6 1.6c0 4-6 7.7-6 7.7Z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-2xl font-extrabold tracking-tight",
          inverted ? "text-primary-foreground" : "text-foreground",
        )}
      >
        Abrigo
      </span>
    </span>
  );
}
