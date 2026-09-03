import { useState } from "react";
import { Download, Printer, Search } from "lucide-react";
import { api } from "../../api.js";
import PageTitle from "../../components/common/PageTitle.jsx";
import {
  downloadDcPdf,
  downloadTransactionPdf,
  printTransaction,
} from "../../services/printService.js";

const labels = [
  ["referenceNo", "Reference No."],
  ["kind", "Transaction"],
  ["inwardReference", "Inward Reference"],
  ["poNo", "PO No."],
  ["itemCode", "Item Code"],
  ["itemName", "Item Name / Usage"],
  ["brand", "Brand"],
  ["type", "Type"],
  ["colour", "Colour"],
  ["dcNo", "DC No."],
  ["section", "Section Name"],
  ["quantity", "Quantity"],
  ["balanceQty", "Balance"],
  ["transactionDate", "Date"],
];

export default function PrintPage({ notify }) {
  const [referenceNo, setReferenceNo] = useState("");
  const [record, setRecord] = useState(null);
  const [dcNo, setDcNo] = useState("");
  const [dcReport, setDcReport] = useState(null);
  const [loading, setLoading] = useState(false);

  async function findRecord(event) {
    event.preventDefault();
    if (!referenceNo.trim()) return;
    setLoading(true);
    setRecord(null);
    try {
      setRecord(
        await api(
          `/transactions/reference/${encodeURIComponent(referenceNo.trim())}`,
        ),
      );
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function findDcReport(event) {
    event.preventDefault();
    if (!dcNo.trim()) return;
    setLoading(true);
    setDcReport(null);
    setRecord(null);
    try {
      setDcReport(
        await api(`/transactions/dc/${encodeURIComponent(dcNo.trim())}`),
      );
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Print"
        subtitle="Enter an Inward No. or Outward No. to view, print or download PDF"
      />
      <section className="card print-search-card no-print">
        <div className="print-search-option">
          <h3>Inward / Outward Number</h3>
          <form onSubmit={findRecord}>
            <input
              value={referenceNo}
              onChange={(event) =>
                setReferenceNo(event.target.value.toUpperCase())
              }
              placeholder="INW-... or OUT-..."
            />
            <button className="primary" disabled={loading}>
              <Search /> View
            </button>
          </form>
        </div>
        <div className="print-search-option">
          <h3>DC Number</h3>
          <form onSubmit={findDcReport}>
            <input
              value={dcNo}
              onChange={(event) => setDcNo(event.target.value.toUpperCase())}
              placeholder="Enter common DC No."
            />
            <button className="primary" disabled={loading}>
              <Search /> View DC
            </button>
          </form>
        </div>
      </section>

      {record && (
        <section className="card transaction-print" id="transaction-print">
          <header>
            <div>
              <h2>Accessories Flow</h2>
              <p>{record.kind} Receipt</p>
            </div>
            <b>{record.referenceNo}</b>
          </header>
          <dl>
            {labels.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  {key === "transactionDate"
                    ? new Date(record[key]).toLocaleString()
                    : record[key] || "—"}
                  {["quantity", "balanceQty"].includes(key)
                    ? ` ${record.unit || ""}`
                    : ""}
                </dd>
              </div>
            ))}
          </dl>
          <footer className="no-print">
            <button onClick={printTransaction}>
              <Printer /> Print
            </button>
            <button
              className="primary"
              onClick={() => downloadTransactionPdf(record)}
            >
              <Download /> Download PDF
            </button>
          </footer>
        </section>
      )}

      {dcReport && (
        <section className="card dc-print" id="dc-print">
          <header>
            <div>
              <h2>Accessories Flow</h2>
              <p>DC Outward Statement</p>
            </div>
            <div className="dc-meta">
              <b>DC No: {dcReport.dcNo}</b>
              <span>Date: {new Date(dcReport.date).toLocaleDateString()}</span>
              <span>Item Name: {dcReport.itemNames.join(", ")}</span>
            </div>
          </header>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Outward No.</th>
                  <th>Inward Reference</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Section Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {dcReport.entries.map((entry, index) => (
                  <tr key={entry._id || entry.referenceNo}>
                    <td>{index + 1}</td>
                    <td>{entry.referenceNo}</td>
                    <td>{entry.inwardReference || "—"}</td>
                    <td>{entry.itemCode}</td>
                    <td>{entry.itemName}</td>
                    <td>{entry.section || "—"}</td>
                    <td>
                      {entry.quantity} {entry.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6">Total</td>
                  <td>{dcReport.totalQuantity}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="remarks">
            <b>Remarks:</b>
            <span></span>
            <span></span>
          </div>
          <div className="signatures">
            <div>
              <span></span>
              <b>Prepared By</b>
            </div>
            <div>
              <span></span>
              <b>Checked By</b>
            </div>
            <div>
              <span></span>
              <b>Authorized By</b>
            </div>
          </div>
          <footer className="no-print">
            <button onClick={printTransaction}>
              <Printer /> Print
            </button>
            <button className="primary" onClick={() => downloadDcPdf(dcReport)}>
              <Download /> Download PDF
            </button>
          </footer>
        </section>
      )}
    </>
  );
}
