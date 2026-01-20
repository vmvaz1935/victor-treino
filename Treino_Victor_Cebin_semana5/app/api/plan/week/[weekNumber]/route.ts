import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/http";
import { intFromString } from "@/lib/validators";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({
  weekNumber: z.string(),
});

export async function GET(_: Request, ctx: { params: Promise<{ weekNumber: string }> }) {
  try {
    const params = paramsSchema.parse(await ctx.params);
    const weekNumber = intFromString.parse(params.weekNumber);

    const plan = await prisma.plan.findFirst({ orderBy: { id: "asc" } });
    if (!plan) return jsonOk({ plan: null, week: null });

    const week = await prisma.planWeekSettings.findUnique({
      where: { planId_weekNumber: { planId: plan.id, weekNumber } },
    });

    const exercises = await prisma.planExercise.findMany({
      where: { planId: plan.id, weekNumber },
      include: { exercise: true },
      orderBy: [{ day: "asc" }, { sessionCode: "asc" }, { sessionNumber: "asc" }, { id: "asc" }],
    });

    return jsonOk({ plan, week, exercises });
  } catch (err) {
    return handleRouteError(err);
  }
}


