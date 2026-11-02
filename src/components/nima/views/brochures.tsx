"use client";

export function BrochuresView({ go }: { go: (r: string, p?: string) => void }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Brochures</h1>
      <p>صفحه بروشورها — در حال ساخت...</p>
      <button onClick={() => go("home")} className="mt-4 text-primary underline">
        بازگشت به خانه
      </button>
    </div>
  );
}