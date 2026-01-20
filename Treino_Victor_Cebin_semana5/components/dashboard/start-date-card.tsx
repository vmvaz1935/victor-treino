"use client";

import { useMemo, useState } from "react";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const KEY = "mm_start_date";

function calcWeekNumber(startISO: string | null): number | null {
  if (!startISO) return null;
  const start = parseISO(startISO);
  const days = differenceInCalendarDays(new Date(), start);
  if (!Number.isFinite(days)) return null;
  const week = Math.floor(days / 7) + 1;
  if (week < 1) return 1;
  if (week > 4) return 4;
  return week;
}

export function StartDateCard() {
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY) ?? "";
    } catch {
      return "";
    }
  });

  const week = useMemo(() => calcWeekNumber(value || null), [value]);

  return (
    <Card className="shadow-card transition-shadow hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Início do mesociclo</CardTitle>
        <CardDescription>
          Defina a data de início para calcular automaticamente a semana atual (1–4).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid w-full gap-2">
          <label className="text-sm font-medium" htmlFor="start-date">
            Data de início
          </label>
          <Input
            id="start-date"
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="text-xs text-muted-foreground">
            {value ? `Selecionada: ${format(parseISO(value), "dd/MM/yyyy")}` : "Nenhuma data definida."}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Button
            className="bg-gradient-primary text-white hover:opacity-95"
            onClick={() => {
              if (!value) {
                toast.error("Escolha uma data primeiro.");
                return;
              }
              localStorage.setItem(KEY, value);
              toast.success("Data de início salva.");
            }}
          >
            Salvar
          </Button>
          <div className="text-sm">
            <span className="text-muted-foreground">Semana atual: </span>
            <span className="font-semibold">{week ?? "—"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


