import Link from "next/link";
import { Suspense } from "react";
import AddBookForm from "../components/AddBookForm";
import BookCard from "../components/BookCard";
import { listBooks } from "../db/queries";

async function BooksList() {
  const books = await listBooks();

  if (books.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 px-5 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-800">No books have been added yet.</p>
        <p className="mt-2 text-sm text-slate-500">
          Add the first title to start building your church library shelf.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_28%,_#f8fafc_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Church Library
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Library Manager
                </h1>
              </div>

              <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
                <Link
                  href="/"
                  className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-900"
                >
                  Books
                </Link>
                <Link
                  href="/members"
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Members
                </Link>
              </nav>
            </div>

            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              Track what is available, what is on loan, and keep the library tidy with quick edits and clean deletion controls.
            </p>
          </div>
        </header>

        <div className="mt-6">
          <AddBookForm />
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Books</h2>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              Catalogue
            </span>
          </div>

          <Suspense
            fallback={
              <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
                Loading books...
              </p>
            }
          >
            <BooksList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}