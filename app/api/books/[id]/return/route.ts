import { NextResponse } from "next/server";
import { sql } from "../../../../../db/index";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return NextResponse.json({ error: "Invalid book id." }, { status: 400 });
  }

  const loan = await sql<{ id: number }[]>`
    select id
    from loans
    where book_id = ${bookId}
      and returned_on is null
    limit 1
  `;

  if (loan.length === 0) {
    return NextResponse.json(
      { error: "This book is not currently on loan." },
      { status: 400 }
    );
  }

  await sql`
    update loans
    set returned_on = current_date
    where id = ${loan[0].id}
  `;

  return NextResponse.json({ message: "Book returned and is now available." });
}
