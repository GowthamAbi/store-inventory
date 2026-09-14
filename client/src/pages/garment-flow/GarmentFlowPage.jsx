import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Printer, Search, Trash2 } from "lucide-react";
import Card from "../../components/common/Card.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { garmentFlowApi } from "../../api/garmentFlowApi.js";

const emptySize = () => ({ size: "", orderPcs: "", cuttingWeightPerPieceKg: "" });
const initialPlan = () => ({ planNo: "", dcNo: "", itemName: "", style: "", fabricGroup: "", coloursText: "", sizes: [emptySize()] });
const round = (value) => Number(value || 0).toFixed(3);

function PrintHeader({ title, data }) {
  return <header className="flow-print-header"><h2>UNIFIED GARMENT FLOW</h2><b>{title}</b><p>Plan: {data?.planNo || "-"} · DC: {data?.dcNo || "-"} · Item: {data?.itemName || "-"} · Style: {data?.style || "-"}</p></header>;
}

export default function GarmentFlowPage({ notify }) {
  const [tab, setTab] = useState("plan");
  const [form, setForm] = useState(initialPlan());
  const [plans, setPlans] = useState([]);
  const [reference, setReference] = useState("");
  const [selected, setSelected] = useState(null);
  const [actual, setActual] = useState(null);
  const [elastic, setElastic] = useState(null);
  const [waste, setWaste] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  const load = async () => setPlans(await garmentFlowApi.plans());
  useEffect(() => { load(); }, []);
  const colours = useMemo(() => form.coloursText.split(",").map((v) => v.trim()).filter(Boolean), [form.coloursText]);

  function changeSize(index, key, value) {
    setForm((old) => ({ ...old, sizes: old.sizes.map((row, i) => i === index ? { ...row, [key]: value } : row) }));
  }

  async function create(event) {
    event.preventDefault();
    const saved = await garmentFlowApi.createPlan({ ...form, colours });
    setSelected(saved); setReference(saved.planNo); setForm(initialPlan()); await load();
    notify("Fabric cutting plan generated");
  }

  async function lookup() {
    const plan = await garmentFlowApi.plan(reference);
    setSelected(plan);
    setActual(null); setElastic(null);
    setMeasurements(plan.sizes.map((row) => ({ size: row.size, measurementMtr: "", piecesPerGarment: 1 })));
  }

  function actualPayload() {
    return { colours: selected.requirements.map((colour) => ({
      colour: colour.colour,
      issuedWeightKg: document.querySelector('[data-issued="' + colour.colour + '"]')?.value,
      sizes: colour.sizes.map((size) => ({
        size: size.size,
        actualPcs: document.querySelector('[data-actual="' + colour.colour + "|" + size.size + '"]')?.value,
        bundleCount: document.querySelector('[data-count="' + colour.colour + "|" + size.size + '"]')?.value,
        bundleWeightKg: document.querySelector('[data-weight="' + colour.colour + "|" + size.size + '"]')?.value,
      })),
    })) };
  }

  async function submitActual() {
    const saved = await garmentFlowApi.saveActual(selected._id, actualPayload());
    setActual(saved); notify("Cutting actual and waste register saved");
  }

  async function generateElastic() {
    const result = await garmentFlowApi.elastic(reference, measurements);
    setElastic(result); notify("Elastic requirement generated from actual cutting PCS");
  }

  async function showWaste() {
    setWaste(await garmentFlowApi.waste()); setTab("waste");
  }

  const printable = elastic || actual || selected;
  return <div className="garment-flow-page">
    <PageTitle title="Fabric → Cutting → Elastic" subtitle="One Plan/DC, exact colour allocation, cutting tally, waste and elastic requirement" />
    <div className="flow-tabs">
      {["plan", "cutting", "elastic"].map((name) => <button key={name} className={tab === name ? "primary" : ""} onClick={() => setTab(name)}>{name.toUpperCase()}</button>)}
      <button className={tab === "waste" ? "primary" : ""} onClick={showWaste}>WASTE REGISTER</button>
    </div>

    {tab === "plan" && <Card title="New Fabric Cutting Requirement"><form onSubmit={create} className="flow-form">
      <div className="cutting-header">
        {[["planNo","Plan No (auto if blank)"],["dcNo","DC No"],["itemName","Item Name"],["style","Style"],["fabricGroup","Fabric Group"],["coloursText","Colours (comma separated)"]].map(([key,label]) => <label key={key}><span>{label}</span><input required={["itemName","style","fabricGroup","coloursText"].includes(key)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
      </div>
      <h3>Size-wise Order & Approved Fabric BOM</h3>
      {form.sizes.map((row,index) => <div className="cutting-size-row" key={index}>
        <b>{index + 1}</b>
        <input placeholder="Size" required value={row.size} onChange={(e) => changeSize(index,"size",e.target.value)} />
        <input placeholder="Order PCS" type="number" min="1" required value={row.orderPcs} onChange={(e) => changeSize(index,"orderPcs",e.target.value)} />
        <input placeholder="Cutting WT/PCS KG" type="number" min="0.0001" step="0.0001" required value={row.cuttingWeightPerPieceKg} onChange={(e) => changeSize(index,"cuttingWeightPerPieceKg",e.target.value)} />
        <button type="button" disabled={form.sizes.length === 1} onClick={() => setForm({ ...form, sizes: form.sizes.filter((_,i) => i !== index) })}><Trash2 /> Remove</button>
      </div>)}
      <div className="row-actions"><button type="button" onClick={() => setForm({ ...form, sizes: [...form.sizes, emptySize()] })}><Plus /> Add Size</button><button className="primary">Generate Plan</button></div>
    </form></Card>}

    {["cutting","elastic"].includes(tab) && <Card title="Plan / DC Lookup"><div className="dc-lookup"><input placeholder="Enter Plan No or DC No" value={reference} onChange={(e) => setReference(e.target.value)} /><button className="primary" onClick={lookup}><Search /> Load</button></div></Card>}

    {selected && tab === "plan" && <PlanTable plan={selected} />}
    {selected && tab === "cutting" && <Card title="Cutting Actual Entry"><PrintHeader title="CUTTING ACTUAL & WASTE TALLY" data={selected} />
      {selected.requirements.map((colour) => <section key={colour.colour} className="cutting-colour"><div className="cutting-colour-head"><h3>{colour.colour}</h3><label><span>Issued Fabric KG</span><input data-issued={colour.colour} type="number" min="0" step="0.001" required /></label></div>
        <table><thead><tr><th>Size</th><th>Planned PCS</th><th>Actual PCS</th><th>Bundle Count</th><th>Bundle Weight KG</th></tr></thead><tbody>{colour.sizes.map((row) => <tr key={row.size}><td>{row.size}</td><td>{row.plannedPcs}</td><td><input data-actual={colour.colour+"|"+row.size} type="number" min="0" defaultValue="0" /></td><td><input data-count={colour.colour+"|"+row.size} type="number" min="0" defaultValue="0" /></td><td><input data-weight={colour.colour+"|"+row.size} type="number" min="0" step="0.001" defaultValue="0" /></td></tr>)}</tbody></table>
      </section>)}
      <div className="row-actions"><button className="primary" onClick={submitActual}>Submit Cutting Actual</button></div>
    </Card>}

    {selected && tab === "elastic" && <Card title="Elastic BOM Measurement"><PrintHeader title="ELASTIC REQUIREMENT" data={selected} />
      {measurements.map((row,index) => <div className="cutting-size-row" key={row.size}><b>{row.size}</b><input type="number" min="0.0001" step="0.0001" placeholder="Measurement MTR/Piece" value={row.measurementMtr} onChange={(e) => setMeasurements(measurements.map((r,i) => i === index ? {...r,measurementMtr:e.target.value} : r))}/><input type="number" min="1" placeholder="Pieces/Garment" value={row.piecesPerGarment} onChange={(e) => setMeasurements(measurements.map((r,i) => i === index ? {...r,piecesPerGarment:e.target.value} : r))}/></div>)}
      <button className="primary" onClick={generateElastic}>Generate from Actual Cutting PCS</button>
    </Card>}

    {actual && <ActualSummary data={actual} />}
    {elastic && <ElasticSummary data={elastic} />}
    {tab === "waste" && <Card title="Fabric Waste Warehouse Register"><table><thead><tr><th>Plan/DC</th><th>Item</th><th>Colour</th><th>Issued KG</th><th>Bundle KG</th><th>Waste KG</th></tr></thead><tbody>{waste.map((row) => <tr key={row._id}><td>{row.planNo}<br/>{row.dcNo}</td><td>{row.itemName}</td><td>{row.colour}</td><td>{round(row.issuedWeightKg)}</td><td>{round(row.bundleWeightKg)}</td><td>{round(row.wasteWeightKg)}</td></tr>)}</tbody></table></Card>}
    {printable && <div className="row-actions no-print"><button onClick={() => window.print()}><Printer /> Print</button><button onClick={() => window.print()}><Download /> Save PDF</button></div>}
    <Card title="Saved Plans"><table><thead><tr><th>Plan</th><th>DC</th><th>Item</th><th>Style</th><th>Fabric Group</th><th>PCS</th><th>KG</th><th>Status</th></tr></thead><tbody>{plans.map((row) => <tr key={row._id} onClick={() => {setSelected(row);setReference(row.planNo)}}><td>{row.planNo}</td><td>{row.dcNo}</td><td>{row.itemName}</td><td>{row.style}</td><td>{row.fabricGroup}</td><td>{row.totalOrderPcs}</td><td>{round(row.grandRequiredWeightKg)}</td><td>{row.status}</td></tr>)}</tbody></table></Card>
  </div>;
}

function PlanTable({ plan }) {
  return <Card title="Generated Colour-wise Requirement"><PrintHeader title="FABRIC CUTTING REQUIREMENT" data={plan} /><p>Fabric Group: <b>{plan.fabricGroup}</b> · Colours: <b>{plan.colours.length}</b></p><table><thead><tr><th>Colour</th><th>Size</th><th>Cutting PCS</th><th>WT/PCS KG</th><th>Required KG</th></tr></thead><tbody>{plan.requirements.flatMap((colour) => colour.sizes.map((row) => <tr key={colour.colour+"-"+row.size}><td>{colour.colour}</td><td>{row.size}</td><td>{row.plannedPcs}</td><td>{round(row.cuttingWeightPerPieceKg)}</td><td>{round(row.requiredWeightKg)}</td></tr>))}</tbody><tfoot><tr><th colSpan="2">GRAND TOTAL</th><th>{plan.totalOrderPcs}</th><th></th><th>{round(plan.grandRequiredWeightKg)}</th></tr></tfoot></table></Card>;
}
function ActualSummary({ data }) { return <Card title="Cutting Tally"><PrintHeader title="CUTTING TALLY" data={data}/><table><thead><tr><th>Colour</th><th>Actual PCS</th><th>Issued KG</th><th>Bundle KG</th><th>Waste KG</th></tr></thead><tbody>{data.colours.map((row) => <tr key={row.colour}><td>{row.colour}</td><td>{row.totalActualPcs}</td><td>{round(row.issuedWeightKg)}</td><td>{round(row.totalBundleWeightKg)}</td><td>{round(row.wasteWeightKg)}</td></tr>)}</tbody><tfoot><tr><th>TOTAL</th><th>{data.totalActualPcs}</th><th>{round(data.totalIssuedWeightKg)}</th><th>{round(data.totalBundleWeightKg)}</th><th>{round(data.totalWasteWeightKg)}</th></tr></tfoot></table></Card>; }
function ElasticSummary({ data }) { return <Card title="Elastic Requirement Result"><PrintHeader title="ELASTIC REQUIREMENT" data={data}/><table><thead><tr><th>Colour</th><th>Size</th><th>Actual PCS</th><th>Measurement</th><th>Pieces/Garment</th><th>Wanted MTR</th></tr></thead><tbody>{data.colours.flatMap((colour) => colour.sizes.map((row) => <tr key={colour.colour+"-"+row.size}><td>{colour.colour}</td><td>{row.size}</td><td>{row.actualCuttingPcs}</td><td>{row.measurementMtr}</td><td>{row.piecesPerGarment}</td><td>{round(row.wantedMtr)}</td></tr>))}</tbody><tfoot><tr><th colSpan="2">GRAND TOTAL</th><th>{data.grandActualPcs}</th><th colSpan="2"></th><th>{round(data.grandWantedMtr)}</th></tr></tfoot></table></Card>; }
