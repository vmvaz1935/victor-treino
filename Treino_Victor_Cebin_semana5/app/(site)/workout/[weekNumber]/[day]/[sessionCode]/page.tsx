import { WorkoutClient } from "@/components/workout/workout-client";

export default async function WorkoutPage(props: {
  params: Promise<{ weekNumber: string; day: string; sessionCode: string }>;
}) {
  const { weekNumber, day, sessionCode } = await props.params;
  const wn = Number.parseInt(weekNumber, 10);

  const d = day.toUpperCase() as "SEG" | "QUA" | "SEX";
  const sc = sessionCode.toUpperCase() as "A" | "B" | "C" | "D" | "DELOAD";

  return (
    <WorkoutClient
      weekNumber={Number.isFinite(wn) ? wn : 1}
      day={d}
      sessionCode={sc}
    />
  );
}


