"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-secondary" />
      <h1 className="text-2xl font-bold">Bandera amarilla</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Algo salió mal al cargar esta página. Probá de nuevo en unos segundos.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        <RotateCcw className="h-4 w-4" /> Reintentar
      </button>
      {error.digest && <p className="mt-4 font-mono text-xs text-muted-foreground">Código: {error.digest}</p>}
    </div>
  );
}
