import { WeekGrid } from "@/components/plan/week-grid";

export default async function WeekPage(props: { params: Promise<{ weekNumber: string }> }) {
  const { weekNumber } = await props.params;
  const wn = Number.parseInt(weekNumber, 10);

  return (
    <div className="flex flex-col gap-6">
      <WeekGrid weekNumber={Number.isFinite(wn) ? wn : 1} />
    </div>
  );
}


