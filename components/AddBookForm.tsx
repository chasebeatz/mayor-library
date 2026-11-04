"use client";

import { FormEvent, useState } from "react";

export default function AddBookForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const yearText = String(formData.get("year") ?? "").trim();

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

    if (!Number.isInteger(year) || year < 1 || year > new Date().getFullYear() + 1) {
      setError("Year must be a real year.");
      setSuccess("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, author, year }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to add book.");
      setSuccess("");
      return;
    }

    setSuccess(payload.message ?? "Book added successfully.");
    form.reset();
    window.location.reload();
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Add a book</h2>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-slate-400"
            placeholder="e.g. The Book of Poetry"
          />
        </div>

        <div>
          <label
            htmlFor="author"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Author
          </label>
          <input
            id="author"
            name="author"
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-slate-400"
            placeholder="e.g. Chinua Achebe"
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min="1"
            max="9999"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-slate-400"
            placeholder="2024"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Saving..." : "Save book"}
        </button>
      </form>
    </section>
  );
}
