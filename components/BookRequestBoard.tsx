"use client";

import { FormEvent, useEffect, useState } from "react";
import { BOOK_CATEGORIES } from "../lib/book-categories";

type RequestStatus = "pending" | "approved" | "rejected";

type BookRequest = {
  id: number;
  title: string;
  requested_by: string;
  category: string;
  notes: string | null;
  status: RequestStatus;
  created_at: string;
};

export default function BookRequestBoard() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadRequests() {
    setLoading(true);

    const response = await fetch("/api/book-requests");
    const payload = (await response.json().catch(() => [])) as BookRequest[];

    setRequests(Array.isArray(payload) ? payload : []);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const requestedBy = String(formData.get("requested_by") ?? "").trim();
    const category = String(formData.get("category") ?? "General");
    const notes = String(formData.get("notes") ?? "").trim();

    if (!title || !requestedBy) {
      setError("Title and member name are required.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    const response = await fetch("/api/book-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, requested_by: requestedBy, category, notes }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to submit request.");
      return;
    }

    setSuccess(payload.message ?? "Book request submitted.");
    form.reset();
    loadRequests();
  }

  async function updateStatus(id: number, status: RequestStatus) {
    const response = await fetch(`/api/book-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { message?: string };

    if (status === "approved") {
      setSuccess(payload.message ?? "Request approved. The book will be available to read within the next 5–7 business days.");
      setError("");
    }

    loadRequests();
  }

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_1.2fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Community picks
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Request a title</h3>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="request-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Book title
            </label>
            <input
              id="request-title"
              name="title"
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder="e.g. The Purpose Driven Life"
            />
          </div>

          <div>
            <label htmlFor="request-by" className="mb-1.5 block text-sm font-medium text-slate-700">
              Requested by
            </label>
            <input
              id="request-by"
              name="requested_by"
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder="Member name"
            />
          </div>

          <div>
            <label htmlFor="request-category" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="request-category"
              name="category"
              defaultValue="General"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              {BOOK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="request-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              id="request-notes"
              name="notes"
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder="Optional note or reason for the request"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Review list
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Request queue</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            {requests.length}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500">No requests yet. The first suggestion will appear here.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{request.title}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      {request.category} • {request.requested_by}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      request.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : request.status === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {request.status}
                  </span>
                </div>

                {request.notes && <p className="mt-2 text-xs text-slate-600">{request.notes}</p>}

                {request.status === "approved" && (
                  <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] text-emerald-700">
                    The book will be available to read within the next 5–7 business days.
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">
                    {new Date(request.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {request.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, "approved")}
                        className="rounded-full bg-emerald-600 px-2.5 py-1.5 font-medium text-white transition hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, "rejected")}
                        className="rounded-full bg-slate-200 px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-300"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
