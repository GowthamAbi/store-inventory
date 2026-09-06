import { useEffect, useState } from "react";
import { getJobs, resumeProductionJob, startProductionJob, stopProductionJob } from "../../api/productionApi.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import QRGenerator from "../../components/qr/QRGenerator.jsx";

const blankStart = { outwardNo: "", machineCode: "", employeeCode: "", section: "Elastic Production", colour: "", size: "", plannedPcs: "" };
const DRAFT_KEY = "elastic_production_scan_draft";

function initialScanForm() {
  const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") || blankStart;
  const params = new URLSearchParams(window.location.search);
  return {
    ...blankStart,
    ...saved,
    ...Object.fromEntries(["outwardNo", "machineCode", "employeeCode", "colour", "size"].filter((key) => params.get(key)).map((key) => [key, params.get(key)])),
  };
}
const blankStop = { action: "Complete", okPcs: "", reworkPcs: "", rejectionPcs: "", reason: "" };

export default function ProductionControlPage({ notify }) {
  const [jobs, setJobs] = useState([]);
  const [startForm, setStartForm] = useState(initialScanForm);
  const [selectedJob, setSelectedJob] = useState(null);
  const [stopForm, setStopForm] = useState(blankStop);
  async function load() { setJobs(await getJobs()); }
  useEffect(() => { load(); }, []);
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(startForm)); }, [startForm]);
  async function start(event) { event.preventDefault(); await startProductionJob(startForm); setStartForm(blankStart); localStorage.removeItem(DRAFT_KEY); await load(); notify("Production started"); }
  async function stop(event) { event.preventDefault(); await stopProductionJob(selectedJob._id, stopForm); setSelectedJob(null); setStopForm(blankStop); await load(); notify("Production status updated"); }
  async function resume(job) { await resumeProductionJob(job._id); await load(); notify("Production resumed"); }
  const eventStatuses = ["Breakdown", "Thread Change", "Box Change", "Size Change", "Other Change"];
  const scannedMachineJob = jobs.find((job) => job.machineCode === startForm.machineCode.toUpperCase() && ["Running", ...eventStatuses].includes(job.status));
  const columns = [
    { key: "jobNo", label: "Production No." }, { key: "outwardNo", label: "Main Outward QR" },
    { key: "colourQr", label: "Colour / Size QR", render: (job) => <div className="mini-qr"><QRGenerator value={`${window.location.origin}/production?outwardNo=${encodeURIComponent(job.outwardNo)}&colour=${encodeURIComponent(job.colour)}&size=${encodeURIComponent(job.size)}`} size={64}/><small>{job.colour}-{job.size}</small></div> },
    { key: "machineCode", label: "Machine QR" }, { key: "employeeCode", label: "Employee QR" },
    { key: "colour", label: "Colour" }, { key: "size", label: "Size" },
    { key: "plannedPcs", label: "Plan Pcs" }, { key: "okPcs", label: "OK Pcs" },
    { key: "balancePcs", label: "Balance" }, { key: "status", label: "Status" },
    { key: "control", label: "Control", render: (job) => eventStatuses.includes(job.status)
      ? <button onClick={() => resume(job)}>Complete Change / Resume</button>
      : job.status === "Running" ? <button className="danger" onClick={() => setSelectedJob(job)}>Stop</button> : "—" },
  ];
  return <>
    <PageTitle title="Production Control" subtitle="Scan main outward, machine and employee QR to start" />
    {scannedMachineJob && <div className="scan-result-card"><b>{scannedMachineJob.machineCode} is {scannedMachineJob.status}</b><span>{scannedMachineJob.colour} · Size {scannedMachineJob.size} · Balance {scannedMachineJob.balancePcs} pcs</span>{scannedMachineJob.status === "Running" ? <button className="danger" onClick={() => setSelectedJob(scannedMachineJob)}>Stop Machine</button> : <button onClick={() => resume(scannedMachineJob)}>Complete Change / Resume</button>}</div>}
    <Card title="Start Production">
      <form className="production-start-grid" onSubmit={start}>{Object.keys(blankStart).map((key) => <label key={key}><span>{key}</span><input required value={startForm[key]} type={key === "plannedPcs" ? "number" : "text"} placeholder={key.includes("Code") || key === "outwardNo" ? "Scan or enter QR code" : ""} onChange={(event) => setStartForm({ ...startForm, [key]: event.target.value })} /></label>)}<button className="primary">Start Production</button></form>
    </Card>
    {selectedJob && <Card title={`Stop ${selectedJob.jobNo}`}><form className="production-start-grid" onSubmit={stop}>
      <label><span>Stop Option</span><select value={stopForm.action} onChange={(event) => setStopForm({ ...stopForm, action: event.target.value })}>{["Complete","Breakdown","Thread Change","Box Change","Size Change","Other Change"].map((value) => <option key={value}>{value}</option>)}</select></label>
      {stopForm.action === "Complete" ? <><label><span>OK Pcs</span><input type="number" value={stopForm.okPcs} onChange={(event) => setStopForm({...stopForm,okPcs:event.target.value})}/></label><label><span>Rework</span><input type="number" value={stopForm.reworkPcs} onChange={(event) => setStopForm({...stopForm,reworkPcs:event.target.value})}/></label><label><span>Rejection</span><input type="number" value={stopForm.rejectionPcs} onChange={(event) => setStopForm({...stopForm,rejectionPcs:event.target.value})}/></label></> : <label><span>Reason</span><input required value={stopForm.reason} onChange={(event) => setStopForm({...stopForm,reason:event.target.value})}/></label>}
      <button className="primary">Confirm Stop</button><button type="button" onClick={() => setSelectedJob(null)}>Cancel</button>
    </form></Card>}
    <Card title="Production Runs"><DataTable rows={jobs} columns={columns} /></Card>
  </>;
}
