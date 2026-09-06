import { useEffect, useState } from "react";
import { api } from "../../api.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

const blank = { masterType: "Vendor", code: "", name: "", contact: "", address: "", gst: "", calculationValue: 0, deliveryPerson: "" };
export default function ProductionMasterPage({ notify }) {
  const [form, setForm] = useState(blank); const [rows, setRows] = useState([]); const [editingId, setEditingId] = useState("");
  async function load(){setRows(await api("/masters"));} useEffect(()=>{load();},[]);
  async function submit(event){event.preventDefault();await api(`/masters${editingId?`/${editingId}`:""}`,{method:editingId?"PUT":"POST",body:JSON.stringify(form)});setForm(blank);setEditingId("");await load();notify("Master data saved");}
  return <><PageTitle title="Production Masters" subtitle="Vendor, section, colour, size and sewing-unit master data"/><Card title={editingId?"Edit Master":"Add Master"}><form className="pending-form" onSubmit={submit}>{Object.keys(blank).map(key=><label key={key}><span>{key}</span>{key==="masterType"?<select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}>{["Vendor","Section","Colour","Size","Sewing Unit"].map(v=><option key={v}>{v}</option>)}</select>:<input type={key==="calculationValue"?"number":"text"} required={["code","name"].includes(key)} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}<button className="primary">Save Master</button></form></Card><Card><DataTable rows={rows} columns={[{key:"masterType",label:"Type"},{key:"code",label:"Code"},{key:"name",label:"Name"},{key:"contact",label:"Contact"},{key:"calculationValue",label:"PCS/MTR Value"},{key:"deliveryPerson",label:"Delivery Person"},{key:"action",label:"Action",render:row=><button onClick={()=>{setEditingId(row._id);setForm({...blank,...row});}}>Edit</button>}]}/></Card></>;
}
