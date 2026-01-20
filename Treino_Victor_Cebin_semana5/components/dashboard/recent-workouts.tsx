import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COOKIE = "mm_user_session";

function dayLabel(d: string) {
  if (d === "SEG") return "Seg";
  if (d === "QUA") return "Qua";
  if (d === "SEX") return "Sex";
  return d;
}

export async function RecentWorkoutsCard() {
  const store = await cookies();
  const userSessionId = store.get(COOKIE)?.value;

  if (!userSessionId) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Últimos treinos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nenhuma sessão iniciada ainda.
        </CardContent>
      </Card>
    );
  }

  const workouts = await prisma.workoutLog.findMany({
    where: { userSessionId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const completed = workouts.filter((w) => w.completedAt != null).length;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Últimos treinos</span>
          <Badge variant="secondary">{completed} concluídos</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {workouts.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sem logs ainda.</div>
        ) : (
          workouts.map((w) => (
            <Link
              key={w.id}
              href={`/workout/${w.weekNumber}/${w.day}/${w.sessionCode}`}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm hover:bg-accent"
            >
              <div className="flex flex-col">
                <div className="font-medium">
                  Semana {w.weekNumber} · {dayLabel(w.day)} · {w.sessionCode}
                </div>
                <div className="text-xs text-muted-foreground">
                  {w.completedAt ? "Concluída" : "Em andamento"}
                </div>
              </div>
              {w.completedAt ? <Badge>OK</Badge> : <Badge variant="secondary">Retomar</Badge>}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}


