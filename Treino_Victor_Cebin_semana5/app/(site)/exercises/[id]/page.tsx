"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Exercise = {
  id: number;
  name: string;
  group: string | null;
  movementPattern: string | null;
  equipment: string | null;
  primaryMuscles: string | null;
  secondaryMuscles: string | null;
  tempoSuggested: string | null;
  variationEasier: string | null;
  variationHarder: string | null;
  checklist: string | null;
  notes: string | null;
};

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10);
  const q = useQuery({
    queryKey: ["exercise", id],
    queryFn: () => apiGet<{ exercise: Exercise | null }>(`/api/exercises/${id}`),
    enabled: Number.isFinite(id),
  });

  if (q.isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (q.isError || !q.data?.exercise) {
    return <Card className="p-6 text-sm text-muted-foreground">Exercício não encontrado.</Card>;
  }

  const e = q.data.exercise;

  const checklist = e.checklist
    ? e.checklist
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^•\s?/, ""))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card px-6 py-6 shadow-card">
        <div className="text-sm text-muted-foreground">Exercício #{e.id}</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{e.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {e.group ? <Badge>{e.group}</Badge> : null}
          {e.equipment ? <Badge variant="secondary">{e.equipment}</Badge> : null}
          {e.movementPattern ? <Badge variant="secondary">{e.movementPattern}</Badge> : null}
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ficha</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          {e.primaryMuscles ? (
            <div>
              <div className="font-medium">Músculos principais</div>
              <div className="text-muted-foreground">{e.primaryMuscles}</div>
            </div>
          ) : null}

          {e.secondaryMuscles ? (
            <div>
              <div className="font-medium">Músculos secundários/estabilizadores</div>
              <div className="text-muted-foreground">{e.secondaryMuscles}</div>
            </div>
          ) : null}

          {e.tempoSuggested ? (
            <div>
              <div className="font-medium">Cadência sugerida</div>
              <div className="text-muted-foreground">{e.tempoSuggested}</div>
            </div>
          ) : null}

          {(e.variationEasier || e.variationHarder) && (
            <div className="grid gap-2 md:grid-cols-2">
              {e.variationEasier ? (
                <div>
                  <div className="font-medium">Variação mais fácil</div>
                  <div className="text-muted-foreground">{e.variationEasier}</div>
                </div>
              ) : null}
              {e.variationHarder ? (
                <div>
                  <div className="font-medium">Variação mais difícil</div>
                  <div className="text-muted-foreground">{e.variationHarder}</div>
                </div>
              ) : null}
            </div>
          )}

          {checklist.length > 0 ? (
            <div>
              <div className="font-medium">Checklist técnico</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {checklist.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {e.notes ? (
            <div>
              <div className="font-medium">Observações</div>
              <div className="text-muted-foreground">{e.notes}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}


