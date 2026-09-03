import { useEffect, useState } from "react";
import { api, exportCsv } from "../../api.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

export default function StockPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api("/items").then(setItems);
  }, []);

  const filteredItems = items.filter((item) => {
    const searchableText = `${item.itemCode} ${item.description} ${item.category}`;
    return searchableText.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
    { key: "itemCode", label: "Item code" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "brand", label: "Brand" },
    { key: "stockQty", label: "Balance" },
    { key: "unit", label: "Unit" },
    { key: "minimumQty", label: "Minimum" },
    {
      key: "health",
      label: "Health",
      render: (item) => (
        <span
          className={
            item.stockQty < item.minimumQty ? "pill red" : "pill green"
          }
        >
          {item.stockQty < item.minimumQty ? "Reorder" : "Healthy"}
        </span>
      ),
    },
  ];

  const action = (
    <div className="actions">
      <input
        placeholder="Search stock..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <button onClick={() => exportCsv("stock.csv", filteredItems)}>
        Export CSV
      </button>
    </div>
  );

  return (
    <>
      <PageTitle
        title="Current stock"
        subtitle="Inward minus outward balance"
        action={action}
      />
      <Card>
        <DataTable columns={columns} rows={filteredItems} />
      </Card>
    </>
  );
}
