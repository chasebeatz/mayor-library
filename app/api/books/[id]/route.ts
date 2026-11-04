import { NextResponse } from "next/server";
import { sql } from "../../../../db/index";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return NextResponse.json({ error: "Invalid book id." }, { status: 400 });
  }

  let payload: { title?: string; author?: string; year?: string | number };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const title = String(payload.title ?? "").trim();
  const author = String(payload.author ?? "").trim();
  const yearText = String(payload.year ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!author) {
    return NextResponse.json({ error: "Author is required." }, { status: 400 });
  }

  if (!/^\d{4}$/.test(yearText)) {
    return NextResponse.json(
      { error: "Year must be a real year." },
      { status: 400 }
    );
  }

  const year = Number(yearText);
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(year) || year < 1 || year > currentYear + 1) {
    return NextResponse.json(
      { error: "Year must be a real year." },
      { status: 400 }
    );
  }

  const existingAuthors = await sql<{ id: number }[]>`
    select id
    from authors
    where lower(name) = lower(${author})
    limit 1
  `;

  let authorId: number;

  if (existingAuthors.length > 0) {
    authorId = existingAuthors[0].id;
  } else {
    const inserted = await sql<{ id: number }[]>`
      insert into authors (name)
      values (${author})
      returning id
    `;

    authorId = inserted[0].id;
  }

  const result = await sql<{ id: number }[]>`
    update books
    set title = ${title}, year = ${year}, author_id = ${authorId}
    where id = ${bookId}
    returning id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Book updated successfully." });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return NextResponse.json({ error: "Invalid book id." }, { status: 400 });
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
      { error: "This book is on loan. Record the return before deleting it." },
      { status: 400 }
    );
  }

  const result = await sql<{ id: number }[]>`
    delete from books
    where id = ${bookId}
    returning id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Book deleted successfully." });
}
