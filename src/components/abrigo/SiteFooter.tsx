import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo";

export const SPONSORS = ["Mercado Bom Vizinho", "Padaria Pão Amigo", "Grupo Colher", "Rede Sabor Solidário"];

export function SponsorStrip({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      Plataforma apoiada por{" "}
      {SPONSORS.map((s, i) => (
        <span key={s}>
          <strong className="font-bold text-foreground">{s}</strong>
          {i < SPONSORS.length - 2 ? ", " : i === SPONSORS.length - 2 ? " e " : "."}
        </span>
      ))}
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <LogoMark className="h-9 w-9 shrink-0" />
          <SponsorStrip />
        </div>
        <nav aria-label="Institucional" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
          <Link to="/empresas" className="underline-offset-4 hover:underline">
            Empresas e ESG
          </Link>
          <Link to="/empresas" hash="governo" className="underline-offset-4 hover:underline">
            Prefeituras
          </Link>
          <Link to="/ajudar" className="underline-offset-4 hover:underline">
            Apoiar o projeto
          </Link>
        </nav>
      </div>
    </footer>
  );
}
