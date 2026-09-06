import { useEffect, useState } from "react";
import { createSewingDelivery, getSewingDeliveries } from "../../api/productionApi.js";
import DataTable from "../../components/DataTable.jsx";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

const blank = { outwardNo:"", sewingName:"", deliveryPerson:"", colour:"", size:"", quantity:"", remarks:"" };
export default function SewingDeliveryPage({ notify }) {
  const [form,setForm]=useState(blank); const [rows,setRows]=useState([]);
  async function load(){setRows(await getSewingDeliveries());} useEffect(()=>{load();},[]);
  async function submit(event){event.preventDefault();await createSewingDelivery(form);setForm(blank);await load();notify("Sewing delivery saved");}
  const columns=[{key:"deliveryNo",label:"Delivery No."},{key:"outwardNo",label:"Main Outward"},{key:"sewingName",label:"Sewing Name"},{key:"deliveryPerson",label:"Delivery Person"},{key:"colour",label:"Colour"},{key:"size",label:"Size"},{key:"quantity",label:"Qty"},{key:"deliveryDate",label:"Date",render:(row)=>new Date(row.deliveryDate).toLocaleDateString()}];
  return <><PageTitle title="Ready for Sewing" subtitle="Split OK pieces by sewing unit and delivery person"/><Card title="Sewing Allocation"><form className="production-start-grid" onSubmit={submit}>{Object.keys(blank).map(key=><label key={key}><span>{key}</span><input required={key!=="remarks"} type={key==="quantity"?"number":"text"} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})}/></label>)}<button className="primary">Save Sewing Delivery</button></form></Card><Card title="Delivery History"><DataTable rows={rows} columns={columns}/></Card></>;
}
