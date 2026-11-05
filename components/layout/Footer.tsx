import Link from "next/link";
import { Logo } from "./Logo";
import { navigation } from "./nav";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="checkered h-1.5 w-full text-foreground/10" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Seguí a los pilotos argentinos en el país y en el mundo: resultados, calendario, campeonatos y noticias en un
            solo lugar.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secciones</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Más</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/api/calendar" className="text-muted-foreground hover:text-foreground">
                Suscribirse al calendario (iCal)
              </a>
            </li>
            <li>
              <Link href="/acerca" className="text-muted-foreground hover:text-foreground">
                Acerca del proyecto y fuentes
              </Link>
            </li>
            <li>
              <Link href="/registro" className="text-muted-foreground hover:text-foreground">
                Crear cuenta
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} Motor Nacional. Proyecto independiente, sin relación con las categorías ni los medios citados.</p>
          <p>Las noticias pertenecen a sus respectivos medios y enlazan a la fuente original.</p>
        </div>
      </div>
    </footer>
  );
}
