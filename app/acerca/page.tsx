import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { NEWS_SOURCES } from "@/lib/sync/news";

export const metadata: Metadata = {
  title: "Acerca del proyecto",
  description: "Qué es Motor Nacional, de dónde salen los datos y cómo funciona.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Acerca de Motor Nacional" icon={Info} />
      <div className="space-y-6 text-muted-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground">
        <p>
          Motor Nacional reúne en un solo lugar toda la actividad de los pilotos argentinos: lo que pasa en el Turismo
          Carretera, el TC2000 o el Turismo Nacional, y también lo que hacen los argentinos en la Fórmula 1, el Mundial de
          Resistencia y el resto del mundo.
        </p>

        <section className="space-y-2">
          <h2>De dónde salen los datos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b className="text-foreground">Fórmula 1:</b> calendario, resultados y campeonatos se sincronizan automáticamente
              desde la API pública de{" "}
              <a className="text-primary hover:underline" href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noopener noreferrer">
                Jolpica-F1
              </a>.
            </li>
            <li>
              <b className="text-foreground">Noticias:</b> se recopilan de los feeds públicos de{" "}
              {NEWS_SOURCES.map((s) => s.name).join(", ")}. Mostramos título, resumen e imagen y siempre enlazamos a la nota
              original.
            </li>
            <li>
              <b className="text-foreground">Categorías nacionales:</b> el calendario, los resultados y los campeonatos se cargan
              desde el panel de administración.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2>Seguí a tus pilotos</h2>
          <p>
            Con una cuenta gratuita podés seguir pilotos para armar un inicio personalizado y recibir notificaciones cuando
            terminan una carrera o aparecen en las noticias.
          </p>
        </section>

        <section className="space-y-2">
          <h2>Aviso</h2>
          <p>
            Es un proyecto independiente, sin relación con las categorías, equipos, pilotos ni medios mencionados. Las marcas
            y contenidos pertenecen a sus respectivos dueños.
          </p>
        </section>
      </div>
    </div>
  );
}
