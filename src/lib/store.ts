"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccuracyStudy, AnalyzerParam, Article, LabEvent, NewsItem, QcSeries, KitValidationStudy } from "./nima-types";
import { SEED_ARTICLES, SEED_EVENTS, SEED_NEWS } from "./data/seeds";

const PREFIX = "nima:";

export function loadKey<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveKey<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

/** Persistent state hook (localStorage-backed, offline-first). */
export function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadKey<T>(key, initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(stored);
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        saveKey(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, set, hydrated] as const;
}

// ---------- Domain-specific stores ----------
export function useArticles() {
  return usePersistent<Article[]>("articles", SEED_ARTICLES);
}
export function useNews() {
  return usePersistent<NewsItem[]>("news", SEED_NEWS);
}
export function useEvents() {
  return usePersistent<LabEvent[]>("events", SEED_EVENTS);
}
export function useQcSeries() {
  return usePersistent<QcSeries[]>("qc", []);
}
export function useAccuracyStudies() {
  return usePersistent<AccuracyStudy[]>("accuracy", []);
}
export function useParams() {
  return usePersistent<AnalyzerParam[]>("params", []);
}
export function useKitValidations() {
  return usePersistent<KitValidationStudy[]>("kitValidation", []);
}

/** Export everything as a single JSON backup file. */
export function exportAllData(): string {
  const dump: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) dump[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k) || "null");
  }
  return JSON.stringify({ app: "Nima", version: 1, exportedAt: new Date().toISOString(), data: dump }, null, 2);
}

export function importAllData(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as { data: Record<string, unknown> };
    if (!parsed.data) return false;
    Object.entries(parsed.data).forEach(([k, v]) => saveKey(k, v));
    return true;
  } catch {
    return false;
  }
}