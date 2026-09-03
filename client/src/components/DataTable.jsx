export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  empty = "No records found",
}) {
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
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
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
              <td className="empty" colSpan={columns.length + 1}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
