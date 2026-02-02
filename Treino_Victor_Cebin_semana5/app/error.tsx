"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na aplicação:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Ocorreu um erro inesperado"}
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-w-2xl overflow-auto rounded bg-muted p-4 text-xs">
            {error.stack}
          </pre>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <a href="/">Voltar para o início</a>
        </Button>
      </div>
    </div>
  );
}
