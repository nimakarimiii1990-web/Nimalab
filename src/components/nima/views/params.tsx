"use client";

export function ParamsView({ go }: { go: (r: string, p?: string) => void }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Device Parameters</h1>
      <p>صفحه پارامترها — در حال ساخت...</p>
      <button onClick={() => go("home")} className="mt-4 text-primary underline">
        بازگشت به خانه
      </button>
    </div>
  );
}