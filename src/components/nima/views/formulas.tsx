"use client";

import { useState } from "react";
import { CALCULATOR } from "./formulas-shared";

export { FORMULAS } from "@/lib/data/formulas";

export function FormulasView({ param, go }: { param: string; go: (r: string, p?: string) => void }) {
  return CALCULATOR({ param, go });
}
