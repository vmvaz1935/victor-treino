import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  search: z.string().optional(),
  group: z.string().optional(),
  equipment: z.string().optional(),
  pattern: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = querySchema.parse({
      search: url.searchParams.get("search") ?? undefined,
      group: url.searchParams.get("group") ?? undefined,
      equipment: url.searchParams.get("equipment") ?? undefined,
      pattern: url.searchParams.get("pattern") ?? undefined,
    });

    const search = query.search?.trim();
    const group = query.group?.trim();
    const equipment = query.equipment?.trim();
    const pattern = query.pattern?.trim();

    const exercises = await prisma.exercise.findMany({
      where: {
        ...(search
          ? {
              name: { contains: search },
            }
          : {}),
        ...(group ? { group } : {}),
        ...(equipment ? { equipment } : {}),
        ...(pattern ? { movementPattern: pattern } : {}),
      },
      orderBy: [{ name: "asc" }],
    });

    return jsonOk({ exercises });
  } catch (err) {
    return handleRouteError(err);
  }
}


