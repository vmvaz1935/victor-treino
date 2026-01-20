import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import * as xlsx from "xlsx";
import { prisma } from "@/lib/prisma";

const DATA_DIR = path.join(process.cwd(), "data");

function listXlsxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".xlsx"))
    .map((f) => path.join(dir, f));
}

function workbookHasSheets(filePath: string, required: string[]): boolean {
  const wb = xlsx.readFile(filePath, { sheetRows: 1 });
  const set = new Set(wb.SheetNames);
  return required.every((s) => set.has(s));
}

function findWorkbookBySheets(required: string[]): string {
  const candidates = listXlsxFiles(DATA_DIR);
  for (const filePath of candidates) {
    try {
      if (workbookHasSheets(filePath, required)) return filePath;
    } catch {
      // ignora
    }
  }
  throw new Error(
    `Não encontrei uma planilha .xlsx em /data com as abas: ${required.join(", ")}. Arquivos em /data: ${candidates
      .map((p) => path.basename(p))
      .join(", ") || "(nenhum)"}`,
  );
}

function assertFileExists(p: string) {
  if (!fs.existsSync(p)) {
    throw new Error(`Arquivo não encontrado: ${p}`);
  }
}

function toInt(value: unknown): number | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function normDay(value: unknown): "SEG" | "QUA" | "SEX" {
  const s = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(".", "");
  if (s === "SEG" || s === "SEGUNDA") return "SEG";
  if (s === "QUA" || s === "QUARTA") return "QUA";
  if (s === "SEX" || s === "SEXTA") return "SEX";
  throw new Error(`Dia inválido: "${value}"`);
}

function normSessionCode(value: unknown): "A" | "B" | "C" | "D" | "DELOAD" {
  const s = String(value ?? "").trim().toUpperCase();
  if (s === "A" || s === "B" || s === "C" || s === "D") return s;
  if (s === "DELOAD") return "DELOAD";
  throw new Error(`Sessão inválida: "${value}"`);
}

function readSheetRows(filePath: string, sheetName: string) {
  const wb = xlsx.readFile(filePath);
  const sh = wb.Sheets[sheetName];
  if (!sh) {
    throw new Error(
      `Aba "${sheetName}" não encontrada em ${path.basename(filePath)}. Abas: ${wb.SheetNames.join(
        ", ",
      )}`,
    );
  }
  return xlsx.utils.sheet_to_json<Record<string, unknown>>(sh, { defval: "", raw: false });
}

async function main() {
  const LIB_XLSX = findWorkbookBySheets(["Biblioteca"]);
  const PLAN_XLSX = findWorkbookBySheets(["Calendário", "Parâmetros", "Plano 8 Semanas"]);
  assertFileExists(LIB_XLSX);
  assertFileExists(PLAN_XLSX);

  const plan = await prisma.plan.upsert({
    where: { id: 1 },
    update: { name: "Treino paciente Victor Cebin (Semanas 5–8 → 1–4)" },
    create: { id: 1, name: "Treino paciente Victor Cebin (Semanas 5–8 → 1–4)" },
  });

  // 1) Biblioteca -> Exercise
  const libRows = readSheetRows(LIB_XLSX, "Biblioteca");
  for (const row of libRows) {
    const id = toInt(row["ID"]);
    if (!id) continue;
    const name = String(row["Exercício"] ?? "").trim();
    if (!name) continue;

    await prisma.exercise.upsert({
      where: { id },
      update: {
        name,
        group: String(row["Grupo"] ?? "").trim() || null,
        movementPattern: String(row["Padrão de movimento"] ?? "").trim() || null,
        equipment: String(row["Equipamento"] ?? "").trim() || null,
        primaryMuscles: String(row["Músculos principais"] ?? "").trim() || null,
        secondaryMuscles:
          String(row["Músculos secundários/estabilizadores"] ?? "").trim() || null,
        tempoSuggested: String(row["Cadência sugerida"] ?? "").trim() || null,
        variationEasier: String(row["Variação mais fácil"] ?? "").trim() || null,
        variationHarder: String(row["Variação mais difícil"] ?? "").trim() || null,
        checklist: String(row["Checklist técnico"] ?? "").trim() || null,
        notes: String(row["Observações"] ?? "").trim() || null,
      },
      create: {
        id,
        name,
        group: String(row["Grupo"] ?? "").trim() || null,
        movementPattern: String(row["Padrão de movimento"] ?? "").trim() || null,
        equipment: String(row["Equipamento"] ?? "").trim() || null,
        primaryMuscles: String(row["Músculos principais"] ?? "").trim() || null,
        secondaryMuscles:
          String(row["Músculos secundários/estabilizadores"] ?? "").trim() || null,
        tempoSuggested: String(row["Cadência sugerida"] ?? "").trim() || null,
        variationEasier: String(row["Variação mais fácil"] ?? "").trim() || null,
        variationHarder: String(row["Variação mais difícil"] ?? "").trim() || null,
        checklist: String(row["Checklist técnico"] ?? "").trim() || null,
        notes: String(row["Observações"] ?? "").trim() || null,
      },
    });
  }

  // 2) Calendário + Parâmetros -> PlanWeekSettings
  const calendarRows = readSheetRows(PLAN_XLSX, "Calendário");
  const paramsRows = readSheetRows(PLAN_XLSX, "Parâmetros");
  const paramsByWeek = new Map<number, Record<string, unknown>>();
  for (const row of paramsRows) {
    const week = toInt(row["Semana"]);
    if (!week) continue;
    paramsByWeek.set(week, row);
  }

  for (const row of calendarRows) {
    const weekOriginal = toInt(row["Semana"]);
    if (!weekOriginal) continue;
    if (weekOriginal < 5 || weekOriginal > 8) continue;
    const weekNumber = weekOriginal - 4;

    const p = paramsByWeek.get(weekOriginal);
    await prisma.planWeekSettings.upsert({
      where: { planId_weekNumber: { planId: plan.id, weekNumber } },
      update: {
        blockFocus: String(row["Bloco/Foco"] ?? "").trim() || null,
        setsDefault: p ? toInt(p["Séries"]) : null,
        repsTargetText: p ? String(p["Reps alvo"] ?? "").trim() || null : null,
        rirTargetText: p ? String(p["RIR alvo"] ?? "").trim() || null : null,
        restText: p ? String(p["Descanso"] ?? "").trim() || null : null,
        tempoText: p ? String(p["Cadência"] ?? "").trim() || null : null,
        notes:
          (String(row["Observações"] ?? "").trim() ||
            (p ? String(p["Notas"] ?? "").trim() : "")) ||
          null,
      },
      create: {
        planId: plan.id,
        weekNumber,
        blockFocus: String(row["Bloco/Foco"] ?? "").trim() || null,
        setsDefault: p ? toInt(p["Séries"]) : null,
        repsTargetText: p ? String(p["Reps alvo"] ?? "").trim() || null : null,
        rirTargetText: p ? String(p["RIR alvo"] ?? "").trim() || null : null,
        restText: p ? String(p["Descanso"] ?? "").trim() || null : null,
        tempoText: p ? String(p["Cadência"] ?? "").trim() || null : null,
        notes:
          (String(row["Observações"] ?? "").trim() ||
            (p ? String(p["Notas"] ?? "").trim() : "")) ||
          null,
      },
    });
  }

  // 3) Plano 8 Semanas -> PlanExercise
  const planRows = readSheetRows(PLAN_XLSX, "Plano 8 Semanas");
  for (const row of planRows) {
    const weekOriginal = toInt(row["Semana"]);
    if (!weekOriginal) continue;
    if (weekOriginal < 5 || weekOriginal > 8) continue;
    const weekNumber = weekOriginal - 4;
    const day = normDay(row["Dia"]);
    const sessionCode = normSessionCode(row["Sessão"]);
    const exerciseId = toInt(row["ID Biblioteca"]);
    if (!exerciseId) continue;

    // garantir exercício existe (planilha do plano já tem nome/grupo, mas a fonte de verdade é a Biblioteca)
    const ex = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!ex) {
      // cria mínimo para não quebrar FK (melhor do que falhar na importação inteira)
      const fallbackName = String(row["Exercício"] ?? "").trim() || `Exercício ${exerciseId}`;
      await prisma.exercise.create({
        data: {
          id: exerciseId,
          name: fallbackName,
          group: String(row["Grupo"] ?? "").trim() || null,
        },
      });
    }

    await prisma.planExercise.upsert({
      where: {
        planId_weekNumber_day_sessionCode_exerciseId: {
          planId: plan.id,
          weekNumber,
          day,
          sessionCode,
          exerciseId,
        },
      },
      update: {
        sessionNumber: toInt(row["Nº Sessão"]),
        sets: toInt(row["Séries"]),
        repsTarget: String(row["Reps alvo"] ?? "").trim() || null,
        rirTarget: String(row["RIR alvo"] ?? "").trim() || null,
        rest: String(row["Descanso"] ?? "").trim() || null,
        tempo: String(row["Cadência"] ?? "").trim() || null,
      },
      create: {
        planId: plan.id,
        weekNumber,
        day,
        sessionCode,
        exerciseId,
        sessionNumber: toInt(row["Nº Sessão"]),
        sets: toInt(row["Séries"]),
        repsTarget: String(row["Reps alvo"] ?? "").trim() || null,
        rirTarget: String(row["RIR alvo"] ?? "").trim() || null,
        rest: String(row["Descanso"] ?? "").trim() || null,
        tempo: String(row["Cadência"] ?? "").trim() || null,
      },
    });
  }

  const exerciseCount = await prisma.exercise.count();
  const weekSettingsCount = await prisma.planWeekSettings.count({ where: { planId: plan.id } });
  const planExerciseCount = await prisma.planExercise.count({ where: { planId: plan.id } });

  console.log(
    [
      "Importação concluída.",
      `Exercises: ${exerciseCount}`,
      `PlanWeekSettings: ${weekSettingsCount}`,
      `PlanExercise: ${planExerciseCount}`,
    ].join(" | "),
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });


