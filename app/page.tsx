import Link from "next/link";
import { Suspense } from "react";
import AddBookForm from "../components/AddBookForm";
import BookRequestBoard from "../components/BookRequestBoard";
import BookSearch from "../components/BookSearch";
import ExportLoanRecordsButton from "../components/ExportLoanRecordsButton";
import LibraryClock from "../components/LibraryClock";
import { listBooks, listLoanRecords, listMembers } from "../db/queries";

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

  return <BookSearch books={books} />;
}

async function SummaryStats() {
  const [books, members] = await Promise.all([listBooks(), listMembers()]);

  const totalBooks = books.length;
  const onLoan = books.filter((book) => book.member_name).length;
  const available = totalBooks - onLoan;
  const overdue = books.filter((book) => {
    if (!book.member_name || !book.due_on) return false;
    return new Date(book.due_on).getTime() < Date.now();
  }).length;

  const stats = [
    { label: "Total books", value: totalBooks },
    { label: "Available", value: available },
    { label: "On loan", value: onLoan },
    { label: "Members", value: members.length },
    { label: "Overdue", value: overdue },
  ];

  return (
    <div className="mt-6 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
          <span className="font-semibold">Overdue alert:</span> {overdue} book{overdue > 1 ? "s" : ""} need attention and follow-up.
        </div>
      )}
    </div>
  );
}

async function OperationsOverview() {
  const [books, members] = await Promise.all([listBooks(), listMembers()]);

  const overdueBooks = books.filter((book) => {
    if (!book.member_name || !book.due_on) return false;
    return new Date(book.due_on).getTime() < Date.now();
  });

  const memberActivity = [...members]
    .map((member) => {
      const activeBorrowings = books.filter((book) => book.member_name === member.name).length;
      return {
        name: member.name,
        activeBorrowings,
      };
    })
    .filter((member) => member.activeBorrowings > 0)
    .sort((a, b) => b.activeBorrowings - a.activeBorrowings)
    .slice(0, 4);

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-rose-900">Overdue reminders</h3>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700">
            {overdueBooks.length}
          </span>
        </div>

        <div className="space-y-3">
          {overdueBooks.length === 0 ? (
            <p className="text-sm text-rose-800">No overdue items right now.</p>
          ) : (
            overdueBooks.slice(0, 4).map((book) => (
              <div key={book.id} className="rounded-2xl border border-rose-200 bg-white/80 p-3">
                <p className="text-sm font-semibold text-slate-900">{book.title}</p>
                <p className="mt-1 text-xs text-slate-600">Borrowed by {book.member_name}</p>
                <p className="mt-1 text-[11px] font-medium text-rose-700">Due {formatDate(book.due_on)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Member activity</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Top
          </span>
        </div>

        <div className="space-y-3">
          {memberActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No active borrowers yet.</p>
          ) : (
            memberActivity.map((member) => (
              <div key={member.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Borrowing</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">
                  {member.activeBorrowings}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

async function LoanRecordPanel() {
  const records = await listLoanRecords();

  if (records.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Recent circulation</h2>
        <p className="mt-3 text-sm text-slate-500">
          No loan records yet. Record the first book collection to start the history.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Recent circulation</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Records
          </span>
          <ExportLoanRecordsButton records={records} />
        </div>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{record.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {record.member_name ? `Collected by ${record.member_name}` : "Member record unavailable"}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {record.returned_on ? "Returned" : "On loan"}
              </p>
              <p className="mt-1 text-xs text-slate-700">
                {record.returned_on ? `Returned ${formatDate(record.returned_on)}` : `Due ${formatDate(record.due_on)}`}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {record.borrowed_on ? `Collected ${formatDate(record.borrowed_on)}` : "Collection date not set"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_28%,_#f8fafc_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-900 shadow-[0_22px_66px_rgba(15,23,42,0.18)]">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-5 py-5 sm:px-7 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm sm:h-14 sm:w-14">
                  <span className="text-xl sm:text-2xl">📚</span>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-200/90">
                    Church Library
                  </p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Library Manager
                  </h1>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
                  <LibraryClock />
                </div>

                <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
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
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Track books, loans, members, and returns with a cleaner, easier-to-read dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <Link
                  href="#catalog"
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 hover:text-white"
                >
                  Catalog
                </Link>
                <Link
                  href="#records"
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 hover:text-white"
                >
                  Records
                </Link>
                <Link
                  href="/members"
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 hover:text-white"
                >
                  Members
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div id="overview">
          <Suspense
            fallback={
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                Loading library overview...
              </div>
            }
          >
            <SummaryStats />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Loading operational insights...
            </div>
          }
        >
          <OperationsOverview />
        </Suspense>

        <div className="mt-6">
          <BookRequestBoard />
        </div>

        <div className="mt-6">
          <AddBookForm />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
          <section id="catalog">
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

          <div id="records" className="xl:pt-8">
            <Suspense
              fallback={
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-500 shadow-sm">
                  Loading circulation records...
                </div>
              }
            >
              <LoanRecordPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}