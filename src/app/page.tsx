"use client";

import { Shell, useHashRoute } from "@/components/nima/shell";
import { HomeView } from "@/components/nima/views/home";
import { TestsView } from "@/components/nima/views/tests";
import { FormulasView } from "@/components/nima/views/formulas";
import { QcView } from "@/components/nima/views/qc";
import { AccuracyView } from "@/components/nima/views/accuracy";
import { IntegrityView } from "@/components/nima/views/integrity";
import { AnalyzerView } from "@/components/nima/views/analyzer";
import { ArticlesView } from "@/components/nima/views/articles";
import { NewsView } from "@/components/nima/views/news";
import { EventsView } from "@/components/nima/views/events";
import { HelpView } from "@/components/nima/views/help";

export default function Page() {
  const { route, param, go } = useHashRoute();

  return (
    <Shell route={route} go={go}>
      <div key={route} className="nima-fade-up">
        {route === "home" && <HomeView go={go} />}
        {route === "tests" && <TestsView param={param} go={go} />}
        {route === "formulas" && <FormulasView param={param} go={go} />}
        {route === "qc" && <QcView />}
        {route === "integrity" && <IntegrityView />}
        {route === "accuracy" && <AccuracyView />}
        {route === "analyzer" && <AnalyzerView go={go} />}
        {route === "articles" && <ArticlesView />}
        {route === "news" && <NewsView />}
        {route === "events" && <EventsView />}
        {route === "help" && <HelpView />}
      </div>
    </Shell>
  );
}
