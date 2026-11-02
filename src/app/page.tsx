"use client";

/* ============================================================
   Nima Lab Companion — app/page.tsx
   مسیرها مطابق ساختار پروژه:
   src/components/nima/views/
   ============================================================ */

import { Shell, useHashRoute } from "@/components/nima/shell";

import { HomeView } from "@/components/nima/views/home";
import { TestsView } from "@/components/nima/views/tests";
import { FormulasView } from "@/components/nima/views/formulas";
import { QcView } from "@/components/nima/views/qc";
import { IntegrityView } from "@/components/nima/views/integrity";
import { AccuracyView } from "@/components/nima/views/accuracy";
import { AnalyzerView } from "@/components/nima/views/analyzer";
import { ArticlesView } from "@/components/nima/views/articles";
import { NewsView } from "@/components/nima/views/news";
import { EventsView } from "@/components/nima/views/events";
import { HelpView } from "@/components/nima/views/help";

// ✅ دو بخش جدید: پارامترها و بروشورها
import { ParamsView } from "@/components/nima/views/params";
import { BrochuresView } from "@/components/nima/views/brochures";

export default function Page() {
  const { route, go } = useHashRoute();

  return (
    <Shell route={route} go={go}>
      {route === "home" && <HomeView go={go} />}
      {route === "tests" && <TestsView go={go} />}
      {route === "formulas" && <FormulasView go={go} />}
      {route === "qc" && <QcView go={go} />}
      {route === "integrity" && <IntegrityView go={go} />}
      {route === "accuracy" && <AccuracyView go={go} />}
      {route === "analyzer" && <AnalyzerView go={go} />}
      {route === "articles" && <ArticlesView go={go} />}
      {route === "news" && <NewsView go={go} />}
      {route === "events" && <EventsView go={go} />}
      {route === "help" && <HelpView go={go} />}

      {/* ===== بخش‌های جدید ===== */}
      {route === "params" && <ParamsView go={go} />}
      {route === "brochures" && <BrochuresView go={go} />}
    </Shell>
  );
}