"use client";

import { useMemo, useState } from "react";
import type { BookListRow } from "../db/queries";
import { parseCategories } from "../lib/book-categories";
import BookCard from "./BookCard";

type BookFilter = "all" | "available" | "on-loan" | "overdue";
type SortOption = "title" | "author" | "due-soon" | "newest";

export default function BookSearch({ books }: { books: BookListRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BookFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("title");

  const categories = useMemo(
    () => ["all", ...new Set(books.flatMap((book) => parseCategories(book.category)))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    const result = books.filter((book) => {
      const bookCategories = parseCategories(book.category);
      const matchesSearch =
        !searchText ||
        [book.title, book.author_name, book.member_name ?? "", bookCategories.join(", ")]
          .join(" ")
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        selectedCategory === "all" || bookCategories.includes(selectedCategory);

      if (!matchesSearch || !matchesCategory) {
        return false;
      }

      if (filter === "available") {
        return !book.member_name;
      }

      if (filter === "on-loan") {
        return Boolean(book.member_name) && !isOverdue(book);
      }

      if (filter === "overdue") {
        return isOverdue(book);
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "author") {
        return a.author_name.localeCompare(b.author_name) || a.title.localeCompare(b.title);
      }

      if (sortBy === "due-soon") {
        const dueA = a.due_on ? new Date(a.due_on).getTime() : Number.MAX_SAFE_INTEGER;
        const dueB = b.due_on ? new Date(b.due_on).getTime() : Number.MAX_SAFE_INTEGER;
        return dueA - dueB;
      }

      if (sortBy === "newest") {
        return Number(b.year ?? 0) - Number(a.year ?? 0);
      }

      return a.title.localeCompare(b.title);
    });

    return result;
  }, [books, filter, query, selectedCategory, sortBy]);

  return (
    <>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="book-search" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Search books
        </label>
        <input
          id="book-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, author or member"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {category === "all" ? "All categories" : category}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="due-soon">Due soon</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "available", label: "Available" },
          { key: "on-loan", label: "On loan" },
          { key: "overdue", label: "Overdue" },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key as BookFilter)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === option.key
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 px-5 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">No matching books found.</p>
          <p className="mt-2 text-sm text-slate-500">
            Try a different title, author, member name, category, or filter option.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </ul>
      )}
    </>
  );
}

function isOverdue(book: BookListRow) {
  if (!book.member_name || !book.due_on) {
    return false;
  }

  return new Date(book.due_on).getTime() < Date.now();
}
