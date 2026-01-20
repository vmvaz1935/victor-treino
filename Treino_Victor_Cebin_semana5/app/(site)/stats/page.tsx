"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatsResp = {
  completedByWeek: { weekNumber: number; completed: number }[];
  volumeByWeekGroup: { weekNumber: number; group: string; volume: number }[];
  weightsByExercise: { exerciseId: number; points: { weightKg: string; updatedAt: string }[] }[];
};

type ExerciseMini = { id: number; name: string; group: string | null };

export default function StatsPage() {
  const q = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<StatsResp>("/api/stats"),
  });

  const exercisesQ = useQuery({
    queryKey: ["exercises-mini"],
    queryFn: () => apiGet<{ exercises: ExerciseMini[] }>("/api/exercises"),
  });

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const idToExercise = useMemo(() => {
    const m = new Map<number, ExerciseMini>();
    for (const e of exercisesQ.data?.exercises ?? []) m.set(e.id, e);
    return m;
  }, [exercisesQ.data?.exercises]);

  const completedData = useMemo(
    () => (q.data?.completedByWeek ?? []).slice().sort((a, b) => a.weekNumber - b.weekNumber),
    [q.data?.completedByWeek],
  );

  const volumeGroups = useMemo(() => {
    return Array.from(new Set((q.data?.volumeByWeekGroup ?? []).map((x) => x.group))).sort();
  }, [q.data?.volumeByWeekGroup]);

  const volumeData = useMemo(() => {
    const rows = q.data?.volumeByWeekGroup ?? [];
    const byWeek = new Map<number, Record<string, number>>();
    for (const r of rows) {
      const cur = byWeek.get(r.weekNumber) ?? {};
      cur[r.group] = (cur[r.group] ?? 0) + r.volume;
      byWeek.set(r.weekNumber, cur);
    }
    return Array.from(byWeek.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([weekNumber, groups]) => ({ weekNumber, ...groups }));
  }, [q.data?.volumeByWeekGroup]);

  const weightSeries = useMemo(() => {
    const id = Number.parseInt(selectedExerciseId, 10);
    const series = q.data?.weightsByExercise.find((w) => w.exerciseId === id)?.points ?? [];
    return series
      .map((p) => ({ updatedAt: p.updatedAt, weightKg: Number(p.weightKg) }))
      .filter((p) => Number.isFinite(p.weightKg));
  }, [q.data?.weightsByExercise, selectedExerciseId]);

  const palette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card px-6 py-6 shadow-card">
        <div className="text-sm text-muted-foreground">Progresso</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Stats</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Volume semanal por grupo, sessões concluídas por semana e histórico de carga por exercício.
        </p>
      </div>

      {q.isLoading || exercisesQ.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : q.isError || exercisesQ.isError ? (
        <Card className="p-6 text-sm text-muted-foreground">Falha ao carregar stats.</Card>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Sessões concluídas por semana</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {completedData.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sem sessões concluídas ainda.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="weekNumber" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="completed" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Volume semanal por grupo (reps)</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {volumeData.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sem volume registrado ainda.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="weekNumber" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {volumeGroups.map((g, idx) => (
                        <Bar key={g} dataKey={g} stackId="vol" fill={palette[idx % palette.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Histórico de carga (últimos 5)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="max-w-sm">
                <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {(q.data?.weightsByExercise ?? [])
                      .map((w) => w.exerciseId)
                      .map((id) => idToExercise.get(id))
                      .filter(Boolean)
                      .sort((a, b) => a!.name.localeCompare(b!.name))
                      .map((e) => (
                        <SelectItem key={e!.id} value={String(e!.id)}>
                          {e!.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-72">
                {selectedExerciseId === "" ? (
                  <div className="text-sm text-muted-foreground">
                    Escolha um exercício para ver o gráfico.
                  </div>
                ) : weightSeries.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sem cargas registradas ainda.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="updatedAt" hide />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weightKg" stroke="var(--chart-2)" strokeWidth={3} dot />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


