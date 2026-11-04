import { Suspense } from "react";
import AddBookForm from "../components/AddBookForm";
import { listBooks } from "../db/queries";

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

async function BooksList() {
  const books = await listBooks();

  if (books.length === 0) {
    return (
      <p className="mt-4 rounded-xl bg-white p-4 text-slate-600">
        No books have been added yet.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {books.map((book) => {
        const status = book.member_name
          ? `On loan to ${book.member_name}, due ${formatDate(book.due_on)}`
          : "Available";

        return (
          <li
            key={book.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {book.title}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  by {book.author_name}
                </p>
              </div>

              {book.year !== null && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {book.year}
                </span>
              )}
            </div>

            <p
              className={`mt-3 text-sm font-medium ${
                book.member_name ? "text-amber-700" : "text-green-700"
              }`}
            >
              {status}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <header className="rounded-3xl bg-slate-900 px-5 py-4 text-white shadow-lg">
          <p className="text-xs uppercase tracking-widest text-slate-300">
            Church Library
          </p>

          <h1 className="mt-2 text-2xl font-bold">Library Manager</h1>

          <p className="mt-2 text-sm text-slate-300">
            Browse books and see which ones are available or on loan.
          </p>
        </header>

        <AddBookForm />

        <Suspense
          fallback={
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500">
              Loading books...
            </p>
          }
        >
          <BooksList />
        </Suspense>
      </div>
    </main>
  );
}