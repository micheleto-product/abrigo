import { Link } from "@tanstack/react-router";
import { BookOpen, HandHeart, MapPinned } from "lucide-react";
import { Logo } from "./Logo";

const ITEMS = [
  { to: "/", label: "Ajuda perto", icon: MapPinned },
  { to: "/guias", label: "Guias e direitos", icon: BookOpen },
  { to: "/ajudar", label: "Quero ajudar", icon: HandHeart },
] as const;

export function AppNav() {
  return (
    <>
      {/* Desktop / tablet */}
      <header className="fixed inset-x-0 top-0 z-[1100] hidden h-[var(--top-nav-h)] border-b-2 border-border bg-card/95 backdrop-blur md:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link to="/" aria-label="Abrigo — início">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1">
            {ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex h-11 items-center gap-2 rounded-xl px-4 font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            ))}
            <Link
              to="/empresas"
              className="ml-2 flex h-11 items-center rounded-xl border-2 border-border px-4 text-sm font-bold text-foreground hover:bg-muted data-[status=active]:border-primary"
            >
              Empresas e governo
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-[1100] border-t-2 border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid h-[var(--bottom-nav-h)] grid-cols-3">
          {ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="group flex h-full flex-col items-center justify-center gap-1 text-sm font-bold text-muted-foreground data-[status=active]:text-foreground"
              >
                <span className="grid h-9 w-16 place-items-center rounded-full transition-colors group-data-[status=active]:bg-primary group-data-[status=active]:text-primary-foreground">
                  <Icon className="size-6" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
