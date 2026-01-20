import { prisma } from "@/lib/prisma";
import { ApiError, handleRouteError, jsonOk } from "@/lib/http";
import { intFromString, numberFromStringOptional } from "@/lib/validators";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({ workoutLogId: z.string().uuid() });

const bodySchema = z.object({
  exerciseId: intFromString,
  setNumber: intFromString,
  weightKg: numberFromStringOptional,
  repsDone: intFromString.optional(),
  rirActual: intFromString.optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ workoutLogId: string }> }) {
  try {
    const params = paramsSchema.parse(await ctx.params);
    const body = bodySchema.parse(await req.json());

    const workout = await prisma.workoutLog.findUnique({ where: { id: params.workoutLogId } });
    if (!workout) throw new ApiError(404, "Treino não encontrado.");

    const updated = await prisma.workoutSetLog.upsert({
      where: {
        workoutLogId_exerciseId_setNumber: {
          workoutLogId: params.workoutLogId,
          exerciseId: body.exerciseId,
          setNumber: body.setNumber,
        },
      },
      update: {
        weightKg: body.weightKg,
        repsDone: body.repsDone,
        rirActual: body.rirActual,
        notes: body.notes?.trim() || null,
      },
      create: {
        workoutLogId: params.workoutLogId,
        exerciseId: body.exerciseId,
        setNumber: body.setNumber,
        weightKg: body.weightKg,
        repsDone: body.repsDone,
        rirActual: body.rirActual,
        notes: body.notes?.trim() || null,
      },
    });

    return jsonOk({ setLog: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}


