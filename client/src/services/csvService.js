export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]).filter(
    (key) => !key.startsWith("_") && key !== "__v",
  );
  const csv = [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
