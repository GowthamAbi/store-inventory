import { useEffect, useState } from "react";
import { getEmployees, getMachines, saveEmployee, saveMachine } from "../../api/productionApi.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import QRGenerator from "../../components/qr/QRGenerator.jsx";

const emptyMachine = { machineCode: "", machineName: "", section: "Elastic Production", capacityPerHour: 0, nextPlan: "" };
const emptyEmployee = { employeeCode: "", employeeName: "", section: "Elastic Production", shift: "General" };

export default function ProductionSetupPage({ notify }) {
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [machine, setMachine] = useState(emptyMachine);
  const [employee, setEmployee] = useState(emptyEmployee);
  async function load() { const [machineData, employeeData] = await Promise.all([getMachines(), getEmployees()]); setMachines(machineData); setEmployees(employeeData); }
  useEffect(() => { load(); }, []);
  async function submitMachine(event) { event.preventDefault(); await saveMachine(machine); setMachine(emptyMachine); await load(); notify("Machine saved and QR code ready"); }
  async function submitEmployee(event) { event.preventDefault(); await saveEmployee(employee); setEmployee(emptyEmployee); await load(); notify("Employee saved and QR code ready"); }
  return <>
    <PageTitle title="Production Setup" subtitle="Machine and employee QR masters" />
    <div className="production-two-column">
      <Card title="Add Machine"><form className="compact-form" onSubmit={submitMachine}>{Object.keys(emptyMachine).map((key) => <label key={key}><span>{key}</span><input required={["machineCode", "machineName"].includes(key)} type={key === "capacityPerHour" ? "number" : "text"} value={machine[key]} onChange={(event) => setMachine({ ...machine, [key]: event.target.value })} /></label>)}<button className="primary">Save Machine</button></form></Card>
      <Card title="Add Employee"><form className="compact-form" onSubmit={submitEmployee}>{Object.keys(emptyEmployee).map((key) => <label key={key}><span>{key}</span><input required={["employeeCode", "employeeName"].includes(key)} value={employee[key]} onChange={(event) => setEmployee({ ...employee, [key]: event.target.value })} /></label>)}<button className="primary">Save Employee</button></form></Card>
    </div>
    <Card title="Machines"><DataTable rows={machines} columns={[{key:"machineQr",label:"Machine QR",render:(row)=><QRGenerator size={72} value={`${window.location.origin}/production?machineCode=${encodeURIComponent(row.machineCode)}`}/>},{key:"machineCode",label:"Code"},{key:"machineName",label:"Machine"},{key:"status",label:"Status"},{key:"nextPlan",label:"Next Plan"}]} /></Card>
    <Card title="Employees"><DataTable rows={employees} columns={[{key:"employeeQr",label:"Employee QR",render:(row)=><QRGenerator size={72} value={`${window.location.origin}/production?employeeCode=${encodeURIComponent(row.employeeCode)}`}/>},{key:"employeeCode",label:"Code"},{key:"employeeName",label:"Employee"},{key:"section",label:"Section"},{key:"shift",label:"Shift"}]} /></Card>
  </>;
}
