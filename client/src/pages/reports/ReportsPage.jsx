import { useState } from "react";
import { api } from "../../api.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { downloadCsv } from "../../services/csvService.js";

const groups = { pos: "PO", inwards: "Inward", outwards: "Outward", plans: "Plans", jobs: "Production", pending: "Pending", sewing: "Sewing", sewingHolds: "Sewing Holds" };
export default function ReportsPage({ notify }) {
  const [filters, setFilters] = useState({ from: "", to: "", po: "", dc: "", item: "", colour: "", machine: "", employee: "", status: "" });
  const [data, setData] = useState(null);
  const [trace, setTrace] = useState("");
  async function load(event) { event?.preventDefault(); setData(await api(`/reports?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v))}`)); }
  async function traceSearch() { if (!trace.trim()) return; setData(await api(`/reports/trace/${encodeURIComponent(trace.trim())}`)); notify("Complete traceability loaded"); }
  function exportAll() { const rows = Object.entries(data || {}).flatMap(([type, entries]) => entries.map((row) => ({ reportType: groups[type] || type, ...row }))); downloadCsv("accessories-flow-report.csv", rows); }
  return <><PageTitle title="Reports & Traceability" subtitle="Search PO, inward, DC, QR, item, colour, machine or employee" />
    <Card title="Complete Traceability"><div className="search-row"><input value={trace} onChange={(e) => setTrace(e.target.value)} placeholder="QR / PO / DC / Item / Colour" /><button className="primary" onClick={traceSearch}>Trace Search</button></div></Card>
    <Card title="Report Filters"><form className="report-filters" onSubmit={load}>{Object.keys(filters).map((key) => <label key={key}><span>{key}</span><input type={["from", "to"].includes(key) ? "date" : "text"} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} /></label>)}<button className="primary">View Reports</button></form></Card>
    {data && <><div className="row-actions"><button onClick={() => window.print()}>Print / PDF</button><button className="primary" onClick={exportAll}>Download Excel CSV</button></div>{Object.entries(groups).map(([key, title]) => data[key]?.length ? <Card title={`${title} (${data[key].length})`} key={key}><DataTable rows={data[key]} columns={Object.keys(data[key][0]).filter((field) => !["__v", "companyId", "factoryId"].includes(field)).slice(0, 12).map((field) => ({ key: field, label: field, render: (row) => typeof row[field] === "object" ? JSON.stringify(row[field]) : String(row[field] ?? "") }))} /></Card> : null)}</>}
  </>;
}
