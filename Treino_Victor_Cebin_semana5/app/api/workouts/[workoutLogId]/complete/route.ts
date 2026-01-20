import { prisma } from "@/lib/prisma";
import { ApiError, handleRouteError, jsonOk } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({ workoutLogId: z.string().uuid() });

export async function POST(_: Request, ctx: { params: Promise<{ workoutLogId: string }> }) {
  try {
    const params = paramsSchema.parse(await ctx.params);

    const existing = await prisma.workoutLog.findUnique({ where: { id: params.workoutLogId } });
    if (!existing) throw new ApiError(404, "Treino não encontrado.");

    const updated = await prisma.workoutLog.update({
      where: { id: params.workoutLogId },
      data: { completedAt: new Date() },
    });

    return jsonOk({ workoutLog: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}


