import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const plan = await prisma.plan.findFirst({
      orderBy: { id: "asc" },
      include: { weekSettings: { orderBy: { weekNumber: "asc" } } },
    });

    return jsonOk({
      plan,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}


