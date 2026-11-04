import { NextResponse } from "next/server";
import { sql } from "../../../db/index";
import { listBooks } from "../../../db/queries";

export async function GET() {
  const books = await listBooks();
  return NextResponse.json(books);
}

export async function POST(request: Request) {
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

  await sql`
    insert into books (title, year, author_id)
    values (${title}, ${year}, ${authorId})
  `;

  return NextResponse.json(
    { message: "Book added successfully." },
    { status: 201 }
  );
}
