import { prisma } from "@/lib/prisma";
import { ApiError, handleRouteError, jsonOk } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({ workoutLogId: z.string().uuid() });

export async function GET(_: Request, ctx: { params: Promise<{ workoutLogId: string }> }) {
  try {
    const params = paramsSchema.parse(await ctx.params);

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: params.workoutLogId },
    });
    if (!workoutLog) throw new ApiError(404, "Treino não encontrado.");

    const planExercises = await prisma.planExercise.findMany({
      where: {
        planId: workoutLog.planId,
        weekNumber: workoutLog.weekNumber,
        day: workoutLog.day,
        sessionCode: workoutLog.sessionCode,
      },
      include: { exercise: true },
      orderBy: [{ sessionNumber: "asc" }, { id: "asc" }],
    });

    const setLogs = await prisma.workoutSetLog.findMany({
      where: { workoutLogId: workoutLog.id },
      orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
    });

    return jsonOk({ workoutLog, planExercises, setLogs });
  } catch (err) {
    return handleRouteError(err);
  }
}


