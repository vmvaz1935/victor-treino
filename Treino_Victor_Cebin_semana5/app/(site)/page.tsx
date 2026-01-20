import { StartDateCard } from "@/components/dashboard/start-date-card";
import { RecentWorkoutsCard } from "@/components/dashboard/recent-workouts";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card px-6 py-6 shadow-card">
        <div className="max-w-2xl">
          <div className="text-sm text-muted-foreground">Bem-vindo</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Treino do paciente João Dias Neto
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Prescrição: Fisioterapeuta Vitor Vaz. Defina a data de início e registre as sessões com
            autosave.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StartDateCard />

        <RecentWorkoutsCard />
      </div>
    </div>
  );
}


