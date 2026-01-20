import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/http";
import { getUserSessionIdFromCookies } from "@/lib/user-session";

export const runtime = "nodejs";

function parseFirstIntFromRangeText(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/(\d+)/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  try {
    const userSessionId = await getUserSessionIdFromCookies();

    const workouts = await prisma.workoutLog.findMany({
      where: { userSessionId, completedAt: { not: null } },
      orderBy: { completedAt: "asc" },
    });

    const workoutIds = workouts.map((w) => w.id);
    const setLogs = await prisma.workoutSetLog.findMany({
      where: { workoutLogId: { in: workoutIds } },
      include: { exercise: true },
      orderBy: [{ updatedAt: "desc" }],
    });

    const planExercises = await prisma.planExercise.findMany({
      where: {
        planId: { in: [...new Set(workouts.map((w) => w.planId))] },
        weekNumber: { in: [...new Set(workouts.map((w) => w.weekNumber))] },
      },
    });

    const peKey = (pe: { planId: number; weekNumber: number; day: string; sessionCode: string; exerciseId: number }) =>
      `${pe.planId}:${pe.weekNumber}:${pe.day}:${pe.sessionCode}:${pe.exerciseId}`;
    const planExerciseByKey = new Map<string, (typeof planExercises)[number]>();
    for (const pe of planExercises) {
      planExerciseByKey.set(peKey(pe), pe);
    }

    const completedByWeek = new Map<number, number>();
    for (const w of workouts) completedByWeek.set(w.weekNumber, (completedByWeek.get(w.weekNumber) ?? 0) + 1);

    // volume semanal por grupo: soma de reps (repsDone ou alvo) por set
    const volumeByWeekGroup = new Map<string, number>();
    for (const log of setLogs) {
      const workout = workouts.find((w) => w.id === log.workoutLogId);
      if (!workout) continue;
      const key = peKey({
        planId: workout.planId,
        weekNumber: workout.weekNumber,
        day: workout.day,
        sessionCode: workout.sessionCode,
        exerciseId: log.exerciseId,
      });
      const pe = planExerciseByKey.get(key);
      const repsFallback = parseFirstIntFromRangeText(pe?.repsTarget ?? null) ?? 0;
      const reps = log.repsDone ?? repsFallback;
      const group = log.exercise.group ?? "Sem grupo";
      const wkGroupKey = `${workout.weekNumber}:${group}`;
      volumeByWeekGroup.set(wkGroupKey, (volumeByWeekGroup.get(wkGroupKey) ?? 0) + reps);
    }

    // últimas 5 cargas por exercício (maior recência)
    const weightsByExercise = new Map<number, { weightKg: string; updatedAt: string }[]>();
    for (const s of setLogs) {
      if (s.weightKg == null) continue;
      const arr = weightsByExercise.get(s.exerciseId) ?? [];
      if (arr.length >= 5) continue;
      arr.push({ weightKg: s.weightKg.toString(), updatedAt: s.updatedAt.toISOString() });
      weightsByExercise.set(s.exerciseId, arr);
    }

    return jsonOk({
      completedByWeek: Array.from(completedByWeek.entries()).map(([weekNumber, completed]) => ({
        weekNumber,
        completed,
      })),
      volumeByWeekGroup: Array.from(volumeByWeekGroup.entries()).map(([k, volume]) => {
        const [weekNumberStr, group] = k.split(":");
        return { weekNumber: Number(weekNumberStr), group, volume };
      }),
      weightsByExercise: Array.from(weightsByExercise.entries()).map(([exerciseId, points]) => ({
        exerciseId,
        points,
      })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}


