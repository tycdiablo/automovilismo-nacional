import Link from "next/link";
import { Flag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="checkered mb-6 h-12 w-24 rounded text-foreground/80" aria-hidden="true" />
      <p className="font-display text-7xl font-extrabold">404</p>
      <h1 className="mt-2 text-xl font-bold">Te fuiste a la leca</h1>
      <p className="mt-2 max-w-md text-muted-foreground">La página que buscás no existe o fue movida.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="btn-primary">
          <Flag className="h-4 w-4" /> Volver a boxes
        </Link>
        <Link href="/buscar" className="btn-outline">
          Buscar
        </Link>
      </div>
    </div>
  );
}
