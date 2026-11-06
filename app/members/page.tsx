import Link from "next/link";
import { Suspense } from "react";
import AddMemberForm from "../../components/AddMemberForm";
import MemberCard from "../../components/MemberCard";
import { listLoanRecords, listMembers } from "../../db/queries";

async function MembersList() {
  const members = await listMembers();

  if (members.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 px-5 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-800">No members yet.</p>
        <p className="mt-2 text-sm text-slate-500">
          Add the first church member to start tracking loans.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </ul>
  );
}

async function BorrowingHistoryPanel() {
  const records = await listLoanRecords();

  if (records.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Borrowing history</h3>
        <p className="mt-3 text-sm text-slate-500">No lending activity has been recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">Borrowing history</h3>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
          Recent
        </span>
      </div>

      <div className="space-y-3">
        {records.slice(0, 5).map((record) => (
          <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{record.title}</p>
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                {record.returned_on ? "Returned" : "On loan"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {record.member_name ? `Borrowed by ${record.member_name}` : "Member record unavailable"}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              {record.borrowed_on ? `Collected ${formatDate(record.borrowed_on)}` : "Collection date not set"}
              {record.due_on ? ` • Due ${formatDate(record.due_on)}` : ""}
            </p>
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
      <div className="mx-auto max-w-5xl">
        <header className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm sm:h-14 sm:w-14">
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Church Library
                  </p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Members
                  </h1>
                </div>
              </div>

              <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
                <Link
                  href="/"
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Books
                </Link>
                <Link
                  href="/members"
                  className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-900"
                >
                  Members
                </Link>
              </nav>
            </div>

            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              Keep the borrowing list organised with member details and quick access to active loans.
            </p>
          </div>
        </header>

        <div className="mt-6">
          <AddMemberForm />
        </div>

        <Suspense
          fallback={
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
              Loading borrowing history...
            </div>
          }
        >
          <BorrowingHistoryPanel />
        </Suspense>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Member directory</h2>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              Active records
            </span>
          </div>

          <Suspense
            fallback={
              <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
                Loading members...
              </p>
            }
          >
            <MembersList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
