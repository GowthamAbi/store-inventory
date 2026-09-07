import { Boxes, Factory } from "lucide-react";

export default function ModuleSelectionPage({ onSelect }) {
  return (
    <section className="module-selection">
      <div className="module-selection-heading">
        <span>ACCESSORIES FLOW</span>
        <h1>Select Your Workspace</h1>
        <p>Open the Store or Elastic Production management module.</p>
      </div>

      <div className="module-selection-grid">
        <button
          className="module-card store-module"
          onClick={() => onSelect("Dashboard")}
        >
          <i><Boxes /></i>
          <div>
            <small>INVENTORY</small>
            <h2>Store</h2>
            <p>PO, inward, stock, outward, DC and print management</p>
          </div>
          <b>Open Store</b>
        </button>

        <button
          className="module-card production-module"
          onClick={() => onSelect("Production Dashboard")}
        >
          <i><Factory /></i>
          <div>
            <small>ELASTIC</small>
            <h2>Production</h2>
            <p>Planning, machines, operators, pending and sewing flow</p>
          </div>
          <b>Open Production</b>
        </button>
      </div>
    </section>
  );
}
