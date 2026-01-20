"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Day = "SEG" | "QUA" | "SEX";
type SessionCode = "A" | "B" | "C" | "D" | "DELOAD";

type PlanExercise = {
  id: number;
  day: Day;
  sessionCode: SessionCode;
  sessionNumber: number | null;
  exerciseId: number;
  exercise: { id: number; name: string; group: string | null };
};

type WeekResponse = {
  plan: { id: number; name: string } | null;
  week: { weekNumber: number; blockFocus: string | null; notes: string | null } | null;
  exercises: PlanExercise[];
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function WeekGrid({ weekNumber }: { weekNumber: number }) {
  const q = useQuery({
    queryKey: ["planWeek", weekNumber],
    queryFn: () => apiGet<WeekResponse>(`/api/plan/week/${weekNumber}`),
  });

  // Nesta versão (semanas 5–8 renumeradas 1–4), o deload vira a semana 4.
  const deload = weekNumber === 4;

  if (q.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (q.isError || !q.data?.plan) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Não foi possível carregar a semana agora.
      </Card>
    );
  }

  const byDay = (d: Day) =>
    q.data.exercises.filter((e) => e.day === d && !(deload && d === "QUA"));

  const sessionsForDay = (d: Day) => {
    const list = byDay(d);
    return uniq(list.map((x) => x.sessionCode)).sort();
  };

  const renderDay = (d: Day, label: string) => {
    const sessions = sessionsForDay(d);
    const disabled = deload && d === "QUA";
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{label}</span>
            {disabled ? <Badge>—</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {disabled ? (
            <div className="text-sm text-muted-foreground">Deload: sem treino na quarta.</div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem sessão cadastrada.</div>
          ) : (
            sessions.map((sessionCode) => (
              <div
                key={`${d}-${sessionCode}`}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
              >
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">Sessão {sessionCode}</div>
                  <div className="text-xs text-muted-foreground">
                    {byDay(d).filter((x) => x.sessionCode === sessionCode).length} exercícios
                  </div>
                </div>
                <Button asChild className="bg-gradient-primary text-white hover:opacity-95">
                  <Link href={`/workout/${weekNumber}/${d}/${sessionCode}`}>Abrir</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border bg-card px-6 py-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm text-muted-foreground">Semana {weekNumber}</div>
            <div className="text-lg font-semibold">{q.data.week?.blockFocus ?? q.data.plan.name}</div>
          </div>
          {deload && <Badge variant="secondary">Deload</Badge>}
        </div>
        {q.data.week?.notes ? (
          <div className="mt-2 text-sm text-muted-foreground">{q.data.week.notes}</div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {renderDay("SEG", "Segunda")}
        {renderDay("QUA", "Quarta")}
        {renderDay("SEX", "Sexta")}
      </div>
    </div>
  );
}


