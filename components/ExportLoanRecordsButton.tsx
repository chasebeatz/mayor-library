"use client";

import { useState } from "react";

export type LoanExportRecord = {
  id: number;
  title: string;
  member_name: string | null;
  borrowed_on: string | null;
  returned_on: string | null;
  due_on: string | null;
};

export default function ExportLoanRecordsButton({ records }: { records: LoanExportRecord[] }) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    const rows = [
      ["Title", "Member", "Collected", "Due", "Returned", "Status"],
      ...records.map((record) => [
        record.title,
        record.member_name ?? "Unknown member",
        record.borrowed_on ?? "",
        record.due_on ?? "",
        record.returned_on ?? "",
        record.returned_on ? "Returned" : "On loan",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "church-library-loan-records.csv";
    link.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || records.length === 0}
      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isExporting ? "Preparing..." : "Export CSV"}
    </button>
  );
}
