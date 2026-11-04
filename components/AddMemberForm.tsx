"use client";

import { FormEvent, useState } from "react";

export default function AddMemberForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!name) {
      setError("Member name is required.");
      setSuccess("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to add member.");
      setSuccess("");
      return;
    }

    setSuccess(payload.message ?? "Member added successfully.");
    form.reset();
    window.location.reload();
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Member registration
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Add a member</h2>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Library users
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

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="member-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="member-name"
            name="name"
            type="text"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            placeholder="e.g. Esther Morgan"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="member-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone number
          </label>
          <input
            id="member-phone"
            name="phone"
            type="tel"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            placeholder="e.g. 024-100-1010"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Saving..." : "Save member"}
          </button>
        </div>
      </form>
    </section>
  );
}
