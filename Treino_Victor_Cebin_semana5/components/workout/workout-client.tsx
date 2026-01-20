"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Day = "SEG" | "QUA" | "SEX";
type SessionCode = "A" | "B" | "C" | "D" | "DELOAD";

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

type PlanExercise = {
  id: number;
  sets: number | null;
  repsTarget: string | null;
  rirTarget: string | null;
  rest: string | null;
  tempo: string | null;
  exerciseId: number;
  exercise: Exercise;
};

type WorkoutLog = {
  id: string;
  weekNumber: number;
  day: Day;
  sessionCode: SessionCode;
  completedAt: string | null;
  planId: number;
};

type WorkoutSetLog = {
  id: string;
  workoutLogId: string;
  exerciseId: number;
  setNumber: number;
  weightKg: string | null;
  repsDone: number | null;
  rirActual: number | null;
  notes: string | null;
  updatedAt: string;
};

type StartResp = { workoutLogId: string };
type WorkoutResp = { workoutLog: WorkoutLog; planExercises: PlanExercise[]; setLogs: WorkoutSetLog[] };

type SetKey = `${number}:${number}`; // exerciseId:setNumber

function key(exerciseId: number, setNumber: number): SetKey {
  return `${exerciseId}:${setNumber}`;
}

export function WorkoutClient(props: { weekNumber: number; day: Day; sessionCode: SessionCode }) {
  const qc = useQueryClient();
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const startOnce = useRef(false);

  const planQ = useQuery({
    queryKey: ["plan"],
    queryFn: () =>
      apiGet<{
        plan: { id: number; name: string } | null;
      }>("/api/plan"),
  });

  const startMut = useMutation({
    mutationFn: (input: { planId: number }) =>
      apiPost<StartResp>("/api/workouts/start", {
        planId: input.planId,
        weekNumber: props.weekNumber,
        day: props.day,
        sessionCode: props.sessionCode,
      }),
    onSuccess: (data) => setWorkoutLogId(data.workoutLogId),
    onError: () => toast.error("Não foi possível iniciar a sessão."),
  });

  useEffect(() => {
    const planId = planQ.data?.plan?.id;
    if (!planId) return;
    if (startOnce.current) return;
    startOnce.current = true;
    startMut.mutate({ planId });
  }, [planQ.data?.plan?.id, startMut]);

  const workoutQ = useQuery({
    queryKey: ["workout", workoutLogId],
    queryFn: () => apiGet<WorkoutResp>(`/api/workouts/${workoutLogId}`),
    enabled: Boolean(workoutLogId),
  });

  const [local, setLocal] = useState<
    Record<
      SetKey,
      {
        weightKg: string;
        repsDone: string;
        rirActual: string;
        notes: string;
        status: "idle" | "saving" | "saved" | "error";
        savedAt?: number;
      }
    >
  >({});
  const localRef = useRef(local);
  useEffect(() => {
    localRef.current = local;
  }, [local]);

  // Inicializa estado local a partir do DB
  useEffect(() => {
    if (!workoutQ.data) return;
    const next: typeof local = {};
    for (const s of workoutQ.data.setLogs) {
      next[key(s.exerciseId, s.setNumber)] = {
        weightKg: s.weightKg ?? "",
        repsDone: s.repsDone?.toString() ?? "",
        rirActual: s.rirActual?.toString() ?? "",
        notes: s.notes ?? "",
        status: "idle",
      };
    }
    setLocal((prev) => ({ ...next, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutQ.data?.workoutLog?.id]);

  const upsertMut = useMutation({
    mutationFn: (input: {
      workoutLogId: string;
      exerciseId: number;
      setNumber: number;
      weightKg: string;
      repsDone: string;
      rirActual: string;
      notes: string;
    }) =>
      apiPost<{ setLog: WorkoutSetLog }>(`/api/workouts/${input.workoutLogId}/set`, {
        exerciseId: input.exerciseId,
        setNumber: input.setNumber,
        weightKg: input.weightKg || undefined,
        repsDone: input.repsDone || undefined,
        rirActual: input.rirActual || undefined,
        notes: input.notes || undefined,
      }),
    onSuccess: async () => {
      if (workoutLogId) await qc.invalidateQueries({ queryKey: ["workout", workoutLogId] });
    },
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => apiPost<{ workoutLog: WorkoutLog }>(`/api/workouts/${id}/complete`, {}),
    onSuccess: async () => {
      toast.success("Sessão finalizada.");
      if (workoutLogId) await qc.invalidateQueries({ queryKey: ["workout", workoutLogId] });
    },
    onError: () => toast.error("Falha ao finalizar sessão."),
  });

  const timers = useRef<Map<SetKey, number>>(new Map());
  const disabled = Boolean(workoutQ.data?.workoutLog.completedAt);

  const updateField = (
    exerciseId: number,
    setNumber: number,
    patch: Partial<(typeof local)[SetKey]>,
  ) => {
    const k = key(exerciseId, setNumber);
    setLocal((prev) => ({
      ...prev,
      [k]: {
        ...(prev[k] ?? {
          weightKg: "",
          repsDone: "",
          rirActual: "",
          notes: "",
          status: "idle" as const,
        }),
        ...patch,
      },
    }));

    if (!workoutLogId || disabled) return;

    const existing = timers.current.get(k);
    if (existing) window.clearTimeout(existing);
    const t = window.setTimeout(() => {
      const cur = (localRef.current[k] ?? {
        weightKg: "",
        repsDone: "",
        rirActual: "",
        notes: "",
        status: "idle",
      }) as (typeof local)[SetKey];

      setLocal((prev) => ({
        ...prev,
        [k]: { ...(prev[k] ?? cur), status: "saving" },
      }));

      upsertMut
        .mutateAsync({
          workoutLogId,
          exerciseId,
          setNumber,
          weightKg: (patch.weightKg ?? cur.weightKg) as string,
          repsDone: (patch.repsDone ?? cur.repsDone) as string,
          rirActual: (patch.rirActual ?? cur.rirActual) as string,
          notes: (patch.notes ?? cur.notes) as string,
        })
        .then(() => {
          setLocal((prev) => ({
            ...prev,
            [k]: { ...(prev[k] ?? cur), status: "saved", savedAt: Date.now() },
          }));
        })
        .catch(() => {
          setLocal((prev) => ({
            ...prev,
            [k]: { ...(prev[k] ?? cur), status: "error" },
          }));
        });
    }, 600);

    timers.current.set(k, t);
  };

  const title = useMemo(() => {
    const d = props.day === "SEG" ? "Segunda" : props.day === "QUA" ? "Quarta" : "Sexta";
    return `Semana ${props.weekNumber} · ${d} · Sessão ${props.sessionCode}`;
  }, [props.day, props.sessionCode, props.weekNumber]);

  if (planQ.isLoading || startMut.isPending || workoutQ.isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (planQ.isError || workoutQ.isError || !workoutQ.data) {
    return <Card className="p-6 text-sm text-muted-foreground">Falha ao carregar a sessão.</Card>;
  }

  const { workoutLog, planExercises, setLogs } = workoutQ.data;

  const setLogByKey = new Map<SetKey, WorkoutSetLog>();
  for (const s of setLogs) setLogByKey.set(key(s.exerciseId, s.setNumber), s);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card px-6 py-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Registrar sessão</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {disabled ? <Badge>Finalizada</Badge> : <Badge variant="secondary">Em andamento</Badge>}
              <Badge variant="secondary">ID: {workoutLog.id.slice(0, 8)}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/plan/week/${props.weekNumber}`}>Voltar à semana</Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-primary text-white hover:opacity-95"
                  disabled={disabled || completeMut.isPending}
                >
                  Finalizar sessão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Finalizar sessão?</DialogTitle>
                  <DialogDescription>
                    Isso marca a sessão como concluída. Você ainda poderá visualizar os dados, mas não editar.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      className="bg-gradient-primary text-white hover:opacity-95"
                      onClick={() => {
                        if (!workoutLogId) return;
                        completeMut.mutate(workoutLogId);
                      }}
                    >
                      Confirmar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Autosave: ao digitar, salvamos automaticamente após uma pequena pausa.
        </div>
      </div>

      <div className="grid gap-4">
        {planExercises.map((pe) => {
          const sets = pe.sets ?? 0;
          const checklist = pe.exercise.checklist
            ? pe.exercise.checklist
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
                .map((l) => l.replace(/^•\s?/, ""))
            : [];

          const savedSome = Array.from({ length: sets }).some((_, i) => {
            const st = local[key(pe.exerciseId, i + 1)]?.status;
            return st === "saved";
          });

          return (
            <Card key={pe.id} className="shadow-card">
              <CardHeader className="gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{pe.exercise.name}</CardTitle>
                    <CardDescription>
                      {[
                        pe.exercise.group,
                        pe.exercise.equipment,
                        pe.exercise.movementPattern,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {savedSome && <Badge variant="secondary">Salvo</Badge>}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Ver técnica</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{pe.exercise.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3 text-sm">
                          {pe.exercise.primaryMuscles ? (
                            <div>
                              <div className="font-medium">Músculos principais</div>
                              <div className="text-muted-foreground">{pe.exercise.primaryMuscles}</div>
                            </div>
                          ) : null}
                          {pe.exercise.secondaryMuscles ? (
                            <div>
                              <div className="font-medium">Músculos secundários/estabilizadores</div>
                              <div className="text-muted-foreground">{pe.exercise.secondaryMuscles}</div>
                            </div>
                          ) : null}
                          {(pe.tempo || pe.exercise.tempoSuggested) && (
                            <div>
                              <div className="font-medium">Cadência</div>
                              <div className="text-muted-foreground">{pe.tempo ?? pe.exercise.tempoSuggested}</div>
                            </div>
                          )}
                          {(pe.exercise.variationEasier || pe.exercise.variationHarder) && (
                            <div className="grid gap-2 md:grid-cols-2">
                              {pe.exercise.variationEasier ? (
                                <div>
                                  <div className="font-medium">Variação mais fácil</div>
                                  <div className="text-muted-foreground">{pe.exercise.variationEasier}</div>
                                </div>
                              ) : null}
                              {pe.exercise.variationHarder ? (
                                <div>
                                  <div className="font-medium">Variação mais difícil</div>
                                  <div className="text-muted-foreground">{pe.exercise.variationHarder}</div>
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
                          {pe.exercise.notes ? (
                            <div>
                              <div className="font-medium">Observações</div>
                              <div className="text-muted-foreground">{pe.exercise.notes}</div>
                            </div>
                          ) : null}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {pe.sets != null ? <Badge variant="secondary">{pe.sets} séries</Badge> : null}
                  {pe.repsTarget ? <Badge variant="secondary">Reps: {pe.repsTarget}</Badge> : null}
                  {pe.rirTarget ? <Badge variant="secondary">{pe.rirTarget}</Badge> : null}
                  {pe.rest ? <Badge variant="secondary">Descanso: {pe.rest}</Badge> : null}
                  {pe.tempo ? <Badge variant="secondary">Cadência: {pe.tempo}</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {sets === 0 ? (
                  <div className="text-sm text-muted-foreground">Sem séries configuradas.</div>
                ) : (
                  <div className="rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[72px]">Set</TableHead>
                          <TableHead>Peso (kg)</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead>RIR</TableHead>
                          <TableHead className="w-[140px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: sets }).map((_, idx) => {
                          const setNumber = idx + 1;
                          const k = key(pe.exerciseId, setNumber);
                          const s = setLogByKey.get(k);
                          const st = local[k] ?? {
                            weightKg: s?.weightKg ?? "",
                            repsDone: s?.repsDone?.toString() ?? "",
                            rirActual: s?.rirActual?.toString() ?? "",
                            notes: s?.notes ?? "",
                            status: "idle" as const,
                          };
                          const statusText =
                            st.status === "saving"
                              ? "Salvando…"
                              : st.status === "saved"
                                ? "Salvo"
                                : st.status === "error"
                                  ? "Erro"
                                  : "";

                          return (
                            <TableRow key={k}>
                              <TableCell className="font-medium">{setNumber}</TableCell>
                              <TableCell>
                                <Input
                                  inputMode="decimal"
                                  placeholder="0"
                                  disabled={disabled}
                                  value={st.weightKg}
                                  onChange={(e) =>
                                    updateField(pe.exerciseId, setNumber, { weightKg: e.target.value })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  inputMode="numeric"
                                  placeholder="0"
                                  disabled={disabled}
                                  value={st.repsDone}
                                  onChange={(e) =>
                                    updateField(pe.exerciseId, setNumber, { repsDone: e.target.value })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  inputMode="numeric"
                                  placeholder="—"
                                  disabled={disabled}
                                  value={st.rirActual}
                                  onChange={(e) =>
                                    updateField(pe.exerciseId, setNumber, { rirActual: e.target.value })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-xs text-muted-foreground">{statusText}</div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="grid gap-2">
                  <div className="text-sm font-medium">Notas do exercício</div>
                  <Textarea
                    disabled={disabled}
                    placeholder="Algo para lembrar..."
                    value={local[key(pe.exerciseId, 1)]?.notes ?? ""}
                    onChange={(e) => {
                      // salva nota no set 1 (simples e funcional)
                      updateField(pe.exerciseId, 1, { notes: e.target.value });
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    Dica: as notas são salvas junto do set 1.
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


