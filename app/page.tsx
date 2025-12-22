import { ArrowRight, Calendar, Clock, Flag } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inicio</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de actividad de los pilotos argentinos.
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary-foreground ring-1 ring-inset ring-secondary/20">
            Temporada 2025
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Live / Featured Widget */}
        <div className="col-span-full lg:col-span-2 rounded-xl bg-card p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              Actividad Reciente
            </h2>
            <span className="text-sm text-muted-foreground">Hace 15 min</span>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden">
                <span className="font-bold text-primary">FC</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Franco Colapinto</h3>
                <p className="text-sm text-muted-foreground">Formula 1 - GP de Monza</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">P12</p>
                <p className="text-xs text-green-600 font-medium">+0.842s</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Free Practice 2</span>
              <span className="mx-1">•</span>
              <Calendar className="w-3 h-3" />
              <span>Hoy, 10:00 AM</span>
            </div>
          </div>
        </div>

        {/* Discovery Widget */}
        <div className="rounded-xl bg-card p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Talentos para seguir</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  IMG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Piloto Promesa {i}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    F4 Española
                  </p>
                </div>
                <button className="text-xs font-medium text-primary hover:text-primary/80">
                  Seguir
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* News Section */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Últimas Noticias</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <article
              key={i}
              className="group relative flex flex-col items-start bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video w-full bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
                  IMG
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-x-2 text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-primary">F1</span>
                  <span>•</span>
                  <time dateTime="2025-09-01">Hace 2 horas</time>
                </div>
                <h3 className="text-lg font-semibold leading-6 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  <span className="absolute inset-0" />
                  Gran actuación de Colapinto en Monza: "Estamos para pelear puntos"
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  El piloto argentino completó una sólida sesión de entrenamientos y se muestra optimista de cara a la clasificación.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
