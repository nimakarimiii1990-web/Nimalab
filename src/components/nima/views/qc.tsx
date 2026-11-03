"use client";

export function QcView() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 3.5rem)" }}>
      <iframe
        src="/iqc.html?embed=1"
        title="Internal Quality Control"
        className="w-full h-full border-0"
        style={{ display: "block" }}
      />
    </div>
  );
}