import { NextResponse } from "next/server";
import { sql } from "../../../db/index";
import { hasColumn, listMembers } from "../../../db/queries";

export async function GET() {
  const members = await listMembers();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  let payload: { name?: string; phone?: string; date_of_birth?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const dateOfBirth = String(payload.date_of_birth ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Member name is required." },
      { status: 400 }
    );
  }

  if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return NextResponse.json(
      { error: "Date of birth must use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  const hasDateOfBirthColumn = await hasColumn("members", "date_of_birth");

  const result = hasDateOfBirthColumn
    ? await sql<{ id: number }[]>`
        insert into members (name, phone, date_of_birth)
        values (${name}, ${phone || null}, ${dateOfBirth || null})
        returning id
      `
    : await sql<{ id: number }[]>`
        insert into members (name, phone)
        values (${name}, ${phone || null})
        returning id
      `;

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Unable to add member." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Member added successfully." },
    { status: 201 }
  );
}
