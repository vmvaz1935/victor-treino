import { prisma } from "@/lib/prisma";
import { ApiError, handleRouteError, jsonOk } from "@/lib/http";
import { daySchema, intFromString, sessionCodeSchema } from "@/lib/validators";
import { getUserSessionIdFromCookies } from "@/lib/user-session";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  planId: intFromString,
  weekNumber: intFromString,
  day: daySchema,
  sessionCode: sessionCodeSchema,
});

export async function POST(req: Request) {
  try {
    const userSessionId = await getUserSessionIdFromCookies();
    const body = bodySchema.parse(await req.json());

    // garante que a sessão exista no DB
    await prisma.userSession.upsert({
      where: { id: userSessionId },
      update: {},
      create: { id: userSessionId },
    });

    const plan = await prisma.plan.findUnique({ where: { id: body.planId } });
    if (!plan) throw new ApiError(404, "Plano não encontrado.");

    const workoutLog = await prisma.workoutLog.upsert({
      where: {
        userSessionId_planId_weekNumber_day_sessionCode: {
          userSessionId,
          planId: body.planId,
          weekNumber: body.weekNumber,
          day: body.day,
          sessionCode: body.sessionCode,
        },
      },
      update: {},
      create: {
        userSessionId,
        planId: body.planId,
        weekNumber: body.weekNumber,
        day: body.day,
        sessionCode: body.sessionCode,
      },
    });

    return jsonOk({ workoutLogId: workoutLog.id });
  } catch (err) {
    return handleRouteError(err);
  }
}


