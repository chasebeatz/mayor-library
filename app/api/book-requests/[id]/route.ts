import { NextResponse } from "next/server";
import { sql } from "../../../../db/index";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let payload: { status?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const status = String(payload.status ?? "").trim();

  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status must be approved or rejected." }, { status: 400 });
  }

  const updated = await sql<{ id: number }[]>`
    update book_requests
    set status = ${status}
    where id = ${Number(id)}
    returning id
  `;

  if (updated.length === 0) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (status === "approved") {
    return NextResponse.json({
      message:
        "Request approved. The book will be available to read within the next 5–7 business days.",
    });
  }

  return NextResponse.json({ message: "Request updated." });
}
