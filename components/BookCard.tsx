"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export type BookCardRow = {
  id: number;
  title: string;
  year: number | null;
  author_name: string;
  member_name: string | null;
  due_on: string | null;
};

export default function BookCard({ book }: { book: BookCardRow }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [members, setMembers] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [draft, setDraft] = useState({
    title: book.title,
    author: book.author_name,
    year: book.year?.toString() ?? "",
  });

  useEffect(() => {
    async function loadMembers() {
      const response = await fetch("/api/members");

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as Array<{ id: number; name: string }>;
      setMembers(data);
      if (data.length > 0) {
        setSelectedMemberId(String(data[0].id));
      }
    }

    loadMembers();
  }, []);

  const statusText = book.member_name
    ? `On loan to ${book.member_name}, due ${formatDate(book.due_on)}`
    : "Available";

  const statusClass = book.member_name
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  async function handleDelete() {
    const confirmed = window.confirm(`Delete “${book.title}”?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/books/${book.id}`, {
      method: "DELETE",
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to delete this book.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess(payload.message ?? "Book deleted.");
    router.refresh();
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = draft.title.trim();
    const author = draft.author.trim();
    const yearText = draft.year.trim();

    if (!title) {
      setError("Title is required.");
      setSuccess("");
      return;
    }

    if (!author) {
      setError("Author is required.");
      setSuccess("");
      return;
    }

    if (!/^\d{4}$/.test(yearText)) {
      setError("Year must be a real year.");
      setSuccess("");
      return;
    }

    const year = Number(yearText);
    const maxYear = new Date().getFullYear() + 1;

    if (!Number.isInteger(year) || year < 1 || year > maxYear) {
      setError("Year must be a real year.");
      setSuccess("");
      return;
    }

    const response = await fetch(`/api/books/${book.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, author, year }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to save changes.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess(payload.message ?? "Book updated.");
    setIsEditing(false);
    router.refresh();
  }

  async function handleLend() {
    if (!selectedMemberId) {
      setError("Select a member before lending the book.");
      setSuccess("");
      return;
    }

    const response = await fetch(`/api/books/${book.id}/lend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId: Number(selectedMemberId) }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to lend this book.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess(payload.message ?? "Book lent successfully.");
    router.refresh();
  }

  async function handleReturn() {
    const response = await fetch(`/api/books/${book.id}/return`, {
      method: "POST",
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to record the return.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess(payload.message ?? "Book returned successfully.");
    router.refresh();
  }

  return (
    <li className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{book.title}</h2>
            {book.year !== null && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                {book.year}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">by {book.author_name}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

      <p className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
        {statusText}
      </p>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      {!book.member_name ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedMemberId}
              onChange={(event) => setSelectedMemberId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleLend}
              disabled={!selectedMemberId}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Lend book
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-amber-800">
            Due back {formatDate(book.due_on)}
          </span>

          <button
            type="button"
            onClick={handleReturn}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Record return
          </button>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <label htmlFor={`title-${book.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Title
            </label>
            <input
              id={`title-${book.id}`}
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor={`author-${book.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Author
            </label>
            <input
              id={`author-${book.id}`}
              value={draft.author}
              onChange={(event) =>
                setDraft((current) => ({ ...current, author: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor={`year-${book.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Year
            </label>
            <input
              id={`year-${book.id}`}
              type="number"
              min="1"
              max="9999"
              value={draft.year}
              onChange={(event) =>
                setDraft((current) => ({ ...current, year: event.target.value }))
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

function formatDate(value: string | Date | null) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
