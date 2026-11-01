import type { LabTest } from "../nima-types";
import { TESTS_BIOCHEM } from "./tests-biochem";
import { TESTS_ENZYME, TESTS_CARDIAC } from "./tests-enzyme";
import { TESTS_HORMONE } from "./tests-hormone";
import { TESTS_HEMATOLOGY } from "./tests-hematology";
import { TESTS_COAG } from "./tests-coag";
import { TESTS_IMMUNO } from "./tests-immuno";
import { TESTS_VIRAL } from "./tests-viral";
import { TESTS_MICRO } from "./tests-micro";
import { TESTS_MOLECULAR } from "./tests-molecular";
import { TESTS_TUMOR } from "./tests-tumor";
import { TESTS_URINE } from "./tests-urine";
import { TESTS_TOX } from "./tests-tox";
import { TESTS_BANK } from "./tests-bank";

export const ALL_TESTS: LabTest[] = [
  ...TESTS_BIOCHEM,
  ...TESTS_ENZYME,
  ...TESTS_CARDIAC,
  ...TESTS_HORMONE,
  ...TESTS_HEMATOLOGY,
  ...TESTS_COAG,
  ...TESTS_IMMUNO,
  ...TESTS_VIRAL,
  ...TESTS_MICRO,
  ...TESTS_MOLECULAR,
  ...TESTS_TUMOR,
  ...TESTS_URINE,
  ...TESTS_TOX,
  ...TESTS_BANK,
];

export const TEST_MAP: Record<string, LabTest> = Object.fromEntries(
  ALL_TESTS.map((t) => [t.id, t])
);

export function searchTests(query: string, cat?: string): LabTest[] {
  const q = query.trim().toLowerCase();
  return ALL_TESTS.filter((t) => {
    if (cat && t.cat !== cat) return false;
    if (!q) return true;
    return (
      t.fa.includes(query.trim()) ||
      t.en.toLowerCase().includes(q) ||
      (t.syn || "").toLowerCase().includes(q) ||
      t.id.includes(q)
    );
  });
}
