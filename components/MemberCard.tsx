"use client";

import type { MemberListRow } from "../db/queries";

export default function MemberCard({ member }: { member: MemberListRow }) {
  return (
    <li className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Member
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{member.name}</h3>
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {member.active_loans} active
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-500">Phone</span>
          <span>{member.phone || "Not supplied"}</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-500">Borrowing</span>
          <span>{member.active_loans === 0 ? "No books out" : `${member.active_loans} book(s)`}</span>
        </div>
      </div>
    </li>
  );
}
