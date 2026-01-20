import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/http";
import { intFromString } from "@/lib/validators";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string() });

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = paramsSchema.parse(await ctx.params);
    const id = intFromString.parse(params.id);

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    return jsonOk({ exercise });
  } catch (err) {
    return handleRouteError(err);
  }
}


