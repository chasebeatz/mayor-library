import { NextResponse } from "next/server";
import { sql } from "../../../../db/index";
import { hasColumn } from "../../../../db/queries";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const memberId = Number(id);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json({ error: "Invalid member id." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Member name is required." }, { status: 400 });
  }

  if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return NextResponse.json(
      { error: "Date of birth must use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  const hasDateOfBirthColumn = await hasColumn("members", "date_of_birth");

  if (hasDateOfBirthColumn) {
    const result = await sql<{ id: number }[]>`
      update members
      set name = ${name}, phone = ${phone || null}, date_of_birth = ${dateOfBirth || null}
      where id = ${memberId}
      returning id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Member updated successfully." });
  }

  const result = await sql<{ id: number }[]>`
    update members
    set name = ${name}, phone = ${phone || null}
    where id = ${memberId}
    returning id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Member updated successfully." });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const memberId = Number(id);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    return NextResponse.json({ error: "Invalid member id." }, { status: 400 });
  }

  const activeLoans = await sql<{ id: number }[]>`
    select id
    from loans
    where member_id = ${memberId}
      and returned_on is null
    limit 1
  `;

  if (activeLoans.length > 0) {
    return NextResponse.json(
      { error: "This member still has an active loan and cannot be deleted." },
      { status: 400 }
    );
  }

  const loanHistory = await sql<{ id: number }[]>`
    select id
    from loans
    where member_id = ${memberId}
    limit 1
  `;

  if (loanHistory.length > 0) {
    return NextResponse.json(
      { error: "This member has loan history and cannot be deleted." },
      { status: 400 }
    );
  }

  const deleted = await sql<{ id: number }[]>`
    delete from members
    where id = ${memberId}
    returning id
  `;

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Member deleted." });
}
