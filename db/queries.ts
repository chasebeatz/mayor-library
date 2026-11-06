import { sql } from "./index";

export type BookListRow = {
  id: number;
  title: string;
  year: number | null;
  category: string;
  author_name: string;
  member_name: string | null;
  due_on: string | null;
};

export async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const rows = await sql<{ exists: boolean }[]>`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = ${tableName}
        and column_name = ${columnName}
    ) as exists
  `;

  return Boolean(rows[0]?.exists);
}

export type MemberListRow = {
  id: number;
  name: string;
  phone: string | null;
  date_of_birth: string | null;
  active_loans: number;
};

export type LoanRecordRow = {
  id: number;
  title: string;
  member_name: string | null;
  borrowed_on: string | null;
  returned_on: string | null;
  due_on: string | null;
};

export async function listBooks(): Promise<BookListRow[]> {
  const hasCategory = await hasColumn("books", "category");

  if (hasCategory) {
    const rows = await sql<BookListRow[]>`
      select
        b.id,
        b.title,
        b.year,
        coalesce(b.category, 'General') as category,
        a.name as author_name,
        m.name as member_name,
        l.due_on
      from books b
      join authors a on a.id = b.author_id
      left join loans l
        on l.book_id = b.id
       and l.returned_on is null
      left join members m on m.id = l.member_id
      order by b.title asc
    `;

    return rows;
  }

  const rows = await sql<Array<Omit<BookListRow, "category"> & { category: string | null }>>`
    select
      b.id,
      b.title,
      b.year,
      'General' as category,
      a.name as author_name,
      m.name as member_name,
      l.due_on
    from books b
    join authors a on a.id = b.author_id
    left join loans l
      on l.book_id = b.id
     and l.returned_on is null
    left join members m on m.id = l.member_id
    order by b.title asc
  `;

  return rows.map((row) => ({
    ...row,
    category: row.category ?? "General",
  }));
}

export async function listMembers(): Promise<MemberListRow[]> {
  const hasDateOfBirth = await hasColumn("members", "date_of_birth");

  if (hasDateOfBirth) {
    const rows = await sql<MemberListRow[]>`
      select
        m.id,
        m.name,
        m.phone,
        m.date_of_birth,
        coalesce(
          (
            select count(*)::int
            from loans l
            where l.member_id = m.id
              and l.returned_on is null
          ),
          0
        ) as active_loans
      from members m
      order by m.name asc
    `;

    return rows;
  }

  const rows = await sql<Array<Omit<MemberListRow, "date_of_birth"> & { date_of_birth: string | null }>>`
    select
      m.id,
      m.name,
      m.phone,
      null as date_of_birth,
      coalesce(
        (
          select count(*)::int
          from loans l
          where l.member_id = m.id
            and l.returned_on is null
        ),
        0
      ) as active_loans
    from members m
    order by m.name asc
  `;

  return rows.map((row) => ({
    ...row,
    date_of_birth: row.date_of_birth ?? null,
  }));
}

export async function listLoanRecords(): Promise<LoanRecordRow[]> {
  const rows = await sql<LoanRecordRow[]>`
    select
      l.id,
      b.title,
      m.name as member_name,
      l.borrowed_on,
      l.returned_on,
      l.due_on
    from loans l
    join books b on b.id = l.book_id
    join members m on m.id = l.member_id
    order by coalesce(l.returned_on, l.borrowed_on) desc, l.id desc
    limit 8
  `;

  return rows;
}
