import { WeekAccordion } from "@/components/plan/week-accordion";

export default function PlanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card px-6 py-6 shadow-card">
        <div className="text-sm text-muted-foreground">Programa</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Plano de 8 semanas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore semana a semana. Cada semana mostra os parâmetros e um link para abrir a grade
          Seg/Qua/Sex.
        </p>
      </div>

      <WeekAccordion />
    </div>
  );
}


