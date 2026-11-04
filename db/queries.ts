import { sql } from "./index";

export type BookListRow = {
  id: number;
  title: string;
  year: number | null;
  author_name: string;
  member_name: string | null;
  due_on: string | null;
};

export async function listBooks(): Promise<BookListRow[]> {
  const rows = await sql<BookListRow[]>`
    select
      b.id,
      b.title,
      b.year,
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
