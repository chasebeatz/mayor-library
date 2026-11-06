import { NextResponse } from "next/server";
import { sql } from "../../../db/index";
import { ensureBookRequestsTable, listBookRequests } from "../../../db/queries";

export async function GET() {
  await ensureBookRequestsTable();
  const requests = await listBookRequests();
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  let payload: { title?: string; requested_by?: string; category?: string; notes?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = String(payload.title ?? "").trim();
  const requestedBy = String(payload.requested_by ?? "").trim();
  const category = String(payload.category ?? "General").trim() || "General";
  const notes = String(payload.notes ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Book title is required." }, { status: 400 });
  }

  if (!requestedBy) {
    return NextResponse.json({ error: "Member name is required." }, { status: 400 });
  }

  try {
    await ensureBookRequestsTable();

    const result = await sql<{ id: number }[]>`
      insert into book_requests (title, requested_by, category, notes)
      values (${title}, ${requestedBy}, ${category}, ${notes || null})
      returning id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
    }

    return NextResponse.json({ message: "Book request submitted successfully." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      { error: `Unable to submit request: ${message}` },
      { status: 500 }
    );
  }
}
