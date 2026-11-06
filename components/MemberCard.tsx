"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MemberListRow } from "../db/queries";

export default function MemberCard({ member }: { member: MemberListRow }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: member.name,
    phone: member.phone ?? "",
    date_of_birth: member.date_of_birth ?? "",
  });
  const age = getAgeFromDate(member.date_of_birth);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete ${member.name}?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/members/${member.id}`, {
      method: "DELETE",
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to delete member.");
      return;
    }

    setError("");
    router.refresh();
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = draft.name.trim();
    const phone = draft.phone.trim();
    const dateOfBirth = draft.date_of_birth.trim();

    if (!name) {
      setError("Member name is required.");
      setSuccess("");
      return;
    }

    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setError("Date of birth must use YYYY-MM-DD format.");
      setSuccess("");
      return;
    }

    const response = await fetch(`/api/members/${member.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        date_of_birth: dateOfBirth,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to update member.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess(payload.message ?? "Member updated successfully.");
    setIsEditing(false);
    router.refresh();
  }

  return (
    <li className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Member
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{member.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setIsEditing((current) => !current);
            }}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-500">Phone</span>
          <span>{member.phone || "Not supplied"}</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-500">Age</span>
          <span>{age !== null ? `${age} years` : "Not supplied"}</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-500">Borrowing</span>
          <span>{member.active_loans === 0 ? "No books out" : `${member.active_loans} book(s)`}</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <label htmlFor={`member-name-${member.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Full name
            </label>
            <input
              id={`member-name-${member.id}`}
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor={`member-phone-${member.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Phone
            </label>
            <input
              id={`member-phone-${member.id}`}
              value={draft.phone}
              onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor={`member-dob-${member.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Date of birth
            </label>
            <input
              id={`member-dob-${member.id}`}
              type="date"
              value={draft.date_of_birth}
              onChange={(event) =>
                setDraft((current) => ({ ...current, date_of_birth: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Save changes
          </button>
        </form>
      )}
    </li>
  );
}

function getAgeFromDate(dateText: string | null): number | null {
  if (!dateText) {
    return null;
  }

  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
}
