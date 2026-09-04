import { useMemo, useState } from "react";

export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  empty = "No records found",
}) {
  const [columnFilters, setColumnFilters] = useState({});
  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        columns.every((column) => {
          const filter = (columnFilters[column.key] || "").trim().toLowerCase();
          if (!filter) return true;
          const value = column.filterValue
            ? column.filterValue(row)
            : row[column.key];
          return String(value ?? "").toLowerCase().includes(filter);
        }),
      ),
    [rows, columns, columnFilters],
  );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
          <tr className="column-filters">
            {columns.map((column) => (
              <th key={column.key}>
                <input
                  aria-label={`Filter ${column.label}`}
                  placeholder="Filter..."
                  value={columnFilters[column.key] || ""}
                  onChange={(event) =>
                    setColumnFilters((current) => ({
                      ...current,
                      [column.key]: event.target.value,
                    }))
                  }
                />
              </th>
            ))}
            {(onEdit || onDelete) && <th />}
          </tr>
        </thead>
        <tbody>
          {filteredRows.length ? (
            filteredRows.map((row) => (
              <tr key={row._id || row.referenceNo || row.itemCode}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row)
                      : (row[column.key] ?? "—")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="row-actions">
                    {onEdit && (
                      <button onClick={() => onEdit(row)}>Edit</button>
                    )}
                    {onDelete && (
                      <button className="danger" onClick={() => onDelete(row)}>
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td className="empty" colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
