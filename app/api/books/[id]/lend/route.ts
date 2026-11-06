import { NextResponse } from "next/server";
import { sql } from "../../../../../db/index";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return NextResponse.json({ error: "Invalid book id." }, { status: 400 });
  }

  let payload: { memberId?: number | string; days?: number | string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const memberId = Number(payload.memberId ?? "");
  const days = Number(payload.days ?? 14);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json(
      { error: "Select a valid member before lending." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(days) || days <= 0 || days > 90) {
    return NextResponse.json(
      { error: "Select a valid rental period between 1 and 90 days." },
      { status: 400 }
    );
  }

  const bookExists = await sql<{ id: number }[]>`
    select id
    from books
    where id = ${bookId}
    limit 1
  `;

  if (bookExists.length === 0) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  const openLoan = await sql<{ id: number }[]>`
    select id
    from loans
    where book_id = ${bookId}
      and returned_on is null
    limit 1
  `;

  if (openLoan.length > 0) {
    return NextResponse.json(
      { error: "This book is already on loan." },
      { status: 400 }
    );
  }

  const memberExists = await sql<{ id: number; name: string }[]>`
    select id, name
    from members
    where id = ${memberId}
    limit 1
  `;

  if (memberExists.length === 0) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  const dueOn = new Date();
  dueOn.setDate(dueOn.getDate() + days);

  const record = await sql<{ due_on: Date; member_name: string }[]>`
    insert into loans (book_id, member_id, borrowed_on, due_on, returned_on)
    values (${bookId}, ${memberId}, current_date, ${dueOn.toISOString().slice(0, 10)}, null)
    returning due_on,
      (select name from members where id = ${memberId}) as member_name
  `;

  const dueDate = record[0]?.due_on ?? dueOn;
  const memberName = record[0]?.member_name ?? memberExists[0].name;

  return NextResponse.json({
    message: `On loan to ${memberName}, due ${formatDate(dueDate)}`,
  });
}

function formatDate(value: string | Date | null) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
