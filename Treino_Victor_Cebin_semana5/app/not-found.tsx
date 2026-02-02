import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Página não encontrada</p>
      </div>
      <Button asChild>
        <Link href="/">Voltar para o início</Link>
      </Button>
    </div>
  );
}
