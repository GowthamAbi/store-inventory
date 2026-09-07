import { useEffect, useMemo, useState } from "react";
import { Download, FileSearch, Layers3, Printer, RefreshCw } from "lucide-react";
import { api } from "../../api.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { downloadExcel } from "../../services/csvService.js";

const groups = {
  pos: "Purchase Orders", inwards: "Inwards", outwards: "Outwards",
  plans: "Production Plans", jobs: "Production", pending: "Pending & Issues",
  sewing: "Sewing Delivery", sewingHolds: "Sewing Holds",
};
const initialFilters = { from: "", to: "", po: "", dc: "", item: "", colour: "", machine: "", employee: "", status: "" };
const hiddenFields = ["__v", "companyId", "factoryId", "password"];

function uniqueValues(data, keys) {
  return [...new Set(Object.values(data || {}).flat().flatMap((row) => keys.map((key) => row[key])).filter(Boolean).map(String))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export default function ReportsPage({ notify }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState(null);
  const [trace, setTrace] = useState("");
  const [activeGroup, setActiveGroup] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(event, nextFilters = filters) {
    event?.preventDefault();
    setLoading(true);
    try {
      const reportData = await api(`/reports?${new URLSearchParams(Object.entries(nextFilters).filter(([, value]) => value))}`);
      setData(reportData);
      setActiveGroup((current) => current && reportData[current] ? current : Object.keys(reportData)[0] || "");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function traceSearch() {
    if (!trace.trim()) return;
    setLoading(true);
    try {
      const reportData = await api(`/reports/trace/${encodeURIComponent(trace.trim())}`);
      setData(reportData);
      setActiveGroup(Object.keys(reportData).find((key) => reportData[key]?.length) || Object.keys(reportData)[0] || "");
      notify("Complete traceability loaded");
    } finally { setLoading(false); }
  }

  const allRows = useMemo(() => Object.entries(data || {}).flatMap(([type, entries]) => entries.map((row) => ({ reportType: groups[type] || type, ...row }))), [data]);
  const filterOptions = useMemo(() => ({
    colour: uniqueValues(data, ["colour"]), machine: uniqueValues(data, ["machineCode"]),
    employee: uniqueValues(data, ["employeeCode"]), status: uniqueValues(data, ["status"]),
  }), [data]);
  const activeRows = data?.[activeGroup] || [];
  const roleScope = ["saas_super_admin", "company_admin", "admin"].includes(user?.role)
    ? "Store + Production" : user?.role === "store" ? "Store Reports" : "Production Reports";
  const columns = activeRows.length ? Object.keys(activeRows[0]).filter((field) => !hiddenFields.includes(field)).slice(0, 14).map((field) => ({
    key: field,
    label: field.replace(/([A-Z])/g, " $1").trim(),
    render: (row) => typeof row[field] === "object" ? JSON.stringify(row[field]) : String(row[field] ?? ""),
  })) : [];

  return <>
    <PageTitle title="Reports & Traceability" subtitle={`${roleScope} · searchable, filterable and Excel-ready`} />
    <div className="report-summary-grid">
      <div><Layers3 /><span><b>{Object.keys(data || {}).length}</b><small>Report Sections</small></span></div>
      <div><FileSearch /><span><b>{allRows.length}</b><small>Matching Records</small></span></div>
      <div><RefreshCw /><span><b>{loading ? "Loading" : "Ready"}</b><small>Report Status</small></span></div>
    </div>
    <Card title="Complete Traceability"><div className="search-row report-trace-search"><input value={trace} onChange={(event) => setTrace(event.target.value)} placeholder="QR / PO / DC / Item / Colour" /><button className="primary" disabled={loading} onClick={traceSearch}><FileSearch /> Trace Search</button></div></Card>
    <Card title="Report Filters"><form className="report-filters professional-report-filters" onSubmit={load}>
      {["from", "to", "po", "dc", "item"].map((key) => <label key={key}><span>{key === "po" ? "PO No" : key === "dc" ? "DC No" : key}</span><input type={["from", "to"].includes(key) ? "date" : "text"} value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} /></label>)}
      {["colour", "machine", "employee", "status"].map((key) => <label key={key}><span>{key}</span><select value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}><option value="">All {key}</option>{filterOptions[key].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}
      <div className="report-filter-actions"><button type="button" onClick={() => { setFilters(initialFilters); load(null, initialFilters); }}>Reset</button><button className="primary" disabled={loading}>{loading ? "Loading..." : "Apply Filters"}</button></div>
    </form></Card>
    {data && <Card title="Report Results">
      <div className="report-toolbar"><div className="report-tabs">{Object.keys(data).map((key) => <button type="button" className={activeGroup === key ? "active" : ""} onClick={() => setActiveGroup(key)} key={key}>{groups[key] || key}<b>{data[key].length}</b></button>)}</div><div className="row-actions"><button onClick={() => window.print()}><Printer /> Print / PDF</button><button className="primary" disabled={!allRows.length} onClick={() => downloadExcel("accessories-flow-report.xls", allRows)}><Download /> Download Excel</button></div></div>
      <div className="active-report-heading"><div><b>{groups[activeGroup] || activeGroup}</b><small>{activeRows.length} records · Click any column heading for dropdown filter</small></div>{activeRows.length > 0 && <button onClick={() => downloadExcel(`${activeGroup}-report.xls`, activeRows)}><Download /> This Report</button>}</div>
      <DataTable loading={loading} rows={activeRows} columns={columns} empty="No matching records" />
    </Card>}
  </>;
}
