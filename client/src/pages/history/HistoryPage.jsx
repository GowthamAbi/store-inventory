import { useEffect, useState } from "react";
import { api, exportCsv } from "../../api.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { formatDate } from "../../utils/formatters.js";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState({ kind: "", from: "", to: "" });

  function loadTransactions() {
    const query = new URLSearchParams(
      Object.entries(filter).filter(([, value]) => value),
    );

    api(`/transactions?${query.toString()}`).then(setTransactions);
  }

  useEffect(loadTransactions, []);

  const columns = [
    { key: "referenceNo", label: "Reference" },
    { key: "kind", label: "Type" },
    { key: "itemCode", label: "Item code" },
    { key: "quantity", label: "Quantity" },
    { key: "balanceQty", label: "Balance" },
    { key: "dcNo", label: "DC no." },
    { key: "section", label: "Section" },
    {
      key: "transactionDate",
      label: "Date",
      render: (transaction) => formatDate(transaction.transactionDate),
    },
  ];

  return (
    <>
      <PageTitle
        title="History"
        subtitle="Filter inward and outward transactions"
        action={
          <button onClick={() => exportCsv("history.csv", transactions)}>
            Export CSV
          </button>
        }
      />

      <Card>
        <div className="filters">
          <select
            value={filter.kind}
            onChange={(event) =>
              setFilter({ ...filter, kind: event.target.value })
            }
          >
            <option value="">All types</option>
            <option value="INWARD">INWARD</option>
            <option value="OUTWARD">OUTWARD</option>
          </select>

          <input
            type="date"
            value={filter.from}
            onChange={(event) =>
              setFilter({ ...filter, from: event.target.value })
            }
          />
          <input
            type="date"
            value={filter.to}
            onChange={(event) =>
              setFilter({ ...filter, to: event.target.value })
            }
          />
          <button className="primary" onClick={loadTransactions}>
            Apply filter
          </button>
        </div>

        <DataTable columns={columns} rows={transactions} />
      </Card>
    </>
  );
}
