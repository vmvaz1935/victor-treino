"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PlanWeekSettings = {
  weekNumber: number;
  blockFocus: string | null;
  setsDefault: number | null;
  repsTargetText: string | null;
  rirTargetText: string | null;
  restText: string | null;
  tempoText: string | null;
  notes: string | null;
};

export function WeekAccordion() {
  const q = useQuery({
    queryKey: ["plan"],
    queryFn: () =>
      apiGet<{
        plan: ({ id: number; name: string; weekSettings: PlanWeekSettings[] } & Record<string, unknown>) | null;
      }>("/api/plan"),
  });

  const weekSettings: PlanWeekSettings[] = q.data?.plan?.weekSettings ?? [];

  if (q.isLoading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (q.isError) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Não foi possível carregar o plano agora.
      </Card>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {weekSettings.map((w) => (
        <AccordionItem key={w.weekNumber} value={`week-${w.weekNumber}`}>
          <AccordionTrigger>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 pr-4 text-left">
              <div className="font-semibold">Semana {w.weekNumber}</div>
              <div className="flex flex-wrap items-center gap-2">
                {w.blockFocus ? <Badge variant="secondary">{w.blockFocus}</Badge> : null}
                {(w.weekNumber === 4 || w.weekNumber === 8) && <Badge>DELOAD</Badge>}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 text-sm">
              <div className="grid gap-1 text-muted-foreground">
                {w.setsDefault != null && <div>Séries padrão: {w.setsDefault}</div>}
                {w.repsTargetText && <div>Reps alvo: {w.repsTargetText}</div>}
                {w.rirTargetText && <div>RIR alvo: {w.rirTargetText}</div>}
                {w.restText && <div>Descanso: {w.restText}</div>}
                {w.tempoText && <div>Cadência: {w.tempoText}</div>}
                {w.notes && <div>Notas: {w.notes}</div>}
              </div>
              <div>
                <Link
                  className="inline-flex items-center rounded-full border bg-card px-3 py-2 text-sm hover:bg-accent"
                  href={`/plan/week/${w.weekNumber}`}
                >
                  Ver semana
                </Link>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}


