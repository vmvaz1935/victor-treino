"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Exercise = {
  id: number;
  name: string;
  group: string | null;
  equipment: string | null;
  movementPattern: string | null;
  primaryMuscles: string | null;
};

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string | null>(null);

  const allQ = useQuery({
    queryKey: ["exercises-all"],
    queryFn: () => apiGet<{ exercises: Exercise[] }>("/api/exercises"),
  });

  const q = useQuery({
    queryKey: ["exercises", search, group, equipment, pattern],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (group) params.set("group", group);
      if (equipment) params.set("equipment", equipment);
      if (pattern) params.set("pattern", pattern);
      const qs = params.toString();
      return apiGet<{ exercises: Exercise[] }>(`/api/exercises${qs ? `?${qs}` : ""}`);
    },
  });

  const exercises = q.data?.exercises ?? [];

  const options = useMemo(() => {
    const base = allQ.data?.exercises ?? [];
    const groups = Array.from(new Set(base.map((e) => e.group).filter(Boolean))).sort() as string[];
    const equipments = Array.from(new Set(base.map((e) => e.equipment).filter(Boolean))).sort() as string[];
    const patterns = Array.from(new Set(base.map((e) => e.movementPattern).filter(Boolean))).sort() as string[];
    return { groups, equipments, patterns };
  }, [allQ.data?.exercises]);

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors",
        active ? "bg-secondary text-secondary-foreground border-transparent" : "bg-card hover:bg-accent",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card px-6 py-6 shadow-card">
        <div className="text-sm text-muted-foreground">Biblioteca</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Exercícios</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Busque e filtre por grupo, equipamento e padrão de movimento.
        </p>
        <div className="mt-4 grid gap-3">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {chip("Limpar filtros", !(group || equipment || pattern), () => {
              setGroup(null);
              setEquipment(null);
              setPattern(null);
            })}
            {options.groups.map((g) => chip(g, group === g, () => setGroup(group === g ? null : g)))}
            {options.equipments.map((eq) =>
              chip(eq, equipment === eq, () => setEquipment(equipment === eq ? null : eq)),
            )}
            {options.patterns.map((p) => chip(p, pattern === p, () => setPattern(pattern === p ? null : p)))}
          </div>
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : q.isError ? (
        <Card className="p-6 text-sm text-muted-foreground">Falha ao carregar exercícios.</Card>
      ) : exercises.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">Nenhum exercício encontrado.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exercises.map((e) => (
            <Link key={e.id} href={`/exercises/${e.id}`}>
              <Card className="h-full cursor-pointer shadow-card transition-shadow hover:shadow-card-hover">
                <CardHeader className="gap-1">
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span className="line-clamp-2">{e.name}</span>
                    <Badge variant="secondary">#{e.id}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {e.group ? <Badge>{e.group}</Badge> : null}
                    {e.equipment ? <Badge variant="secondary">{e.equipment}</Badge> : null}
                    {e.movementPattern ? <Badge variant="secondary">{e.movementPattern}</Badge> : null}
                  </div>
                  {e.primaryMuscles ? (
                    <div className="text-xs text-muted-foreground">{e.primaryMuscles}</div>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


