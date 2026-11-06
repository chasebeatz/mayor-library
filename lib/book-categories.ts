export const BOOK_CATEGORIES = [
  "General",
  "Art",
  "History",
  "Languages",
  "Science",
  "Literature",
  "Technology",
  "Religion",
  "Mathematics",
  "Music",
  "Geography",
  "Philosophy",
  "Biography",
] as const;

export function parseCategories(value: string | string[] | null | undefined): string[] {
  const rawValues = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((item) => item.trim());

  const normalized = rawValues
    .flatMap((item) => item.split("/"))
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);

  const withoutGeneral = normalized.filter((item) => item !== "General");

  return withoutGeneral.length > 0 ? withoutGeneral : ["General"];
}

export function formatCategories(value: string | string[] | null | undefined): string {
  return parseCategories(value).join(", ");
}
