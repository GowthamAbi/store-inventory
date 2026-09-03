import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import {
  createPublicOutward,
  getPublicInward,
} from "../../api/publicOutwardApi.js";
import { downloadTransactionPdf } from "../../services/printService.js";

export default function PublicOutwardPage({ inwardNo }) {
  const [inward, setInward] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState({ itemName: "", dcNo: "", section: "", wantedMtr: "" });
  const [status, setStatus] = useState({
    loading: true,
    saving: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    getPublicInward(inwardNo)
      .then((data) => {
        setInward(data);
        setForm((current) => ({ ...current, itemName: data.description || "" }));
        setStatus((current) => ({ ...current, loading: false }));
      })
      .catch((error) =>
        setStatus((current) => ({
          ...current,
          loading: false,
          error: error.message,
        })),
      );
  }, [inwardNo]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitOutward(event) {
    event.preventDefault();
    const wantedQty = Number(form.wantedMtr);

    if (!form.itemName.trim() || !form.dcNo.trim() || !form.section.trim() || wantedQty <= 0) {
      setStatus((current) => ({
        ...current,
        error: "Item Name, DC No, Section Name and valid Wanted Mtr are required",
        success: "",
      }));
      return;
    }

    setStatus((current) => ({
      ...current,
      saving: true,
      error: "",
      success: "",
    }));

    try {
      const result = await createPublicOutward({
        inwardNo,
        itemName: form.itemName.trim(),
        dcNo: form.dcNo.trim(),
        section: form.section.trim(),
        wantedQty,
      });

      setInward((current) => ({
        ...current,
        availableQty: result.availableQty,
      }));
      setReceipt(result);
      setForm((current) => ({ ...current, wantedMtr: "" }));
      setStatus({
        loading: false,
        saving: false,
        error: "",
        success: `Outward saved: ${result.outwardNo}`,
      });
    } catch (error) {
      setStatus((current) => ({
        ...current,
        saving: false,
        error: error.message,
      }));
    }
  }

  if (status.loading)
    return (
      <main className="public-outward-state">Loading inward details...</main>
    );
  if (!inward)
    return <main className="public-outward-state error">{status.error}</main>;

  return (
    <main className="public-outward-page">
      <section className="public-outward-card">
        <header className="public-outward-header">
          <span className="public-outward-logo">
            <PackageCheck />
          </span>
          <div>
            <h1>Outward Entry</h1>
            <p>Accessories Flow · QR-linked stock issue</p>
          </div>
        </header>

        <div className="inward-summary">
          <h2>Inward Details</h2>
          <dl>
            <div>
              <dt>Inward No.</dt>
              <dd>{inward.inwardNo}</dd>
            </div>
            <div>
              <dt>Item Code</dt>
              <dd>{inward.itemCode}</dd>
            </div>
            <div>
              <dt>Item Name</dt>
              <dd>{inward.description}</dd>
            </div>
            <div>
              <dt>Brand</dt>
              <dd>{inward.brand || "—"}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{inward.type || "—"}</dd>
            </div>
            <div>
              <dt>Colour</dt>
              <dd>{inward.colour || "—"}</dd>
            </div>
            <div>
              <dt>Inward Mtr</dt>
              <dd>
                {inward.inwardQty} {inward.unit}
              </dd>
            </div>
            <div className="available">
              <dt>Available Mtr</dt>
              <dd>
                {inward.availableQty} {inward.unit}
              </dd>
            </div>
          </dl>
        </div>

        <form className="public-outward-form" onSubmit={submitOutward}>
          <label>
            <span>Inward Reference</span>
            <input value={inward.inwardNo} readOnly />
          </label>
          <label>
            <span>DC No.</span>
            <input
              name="dcNo"
              value={form.dcNo}
              onChange={updateField}
              placeholder="Enter DC number"
            />
          </label>
          <label>
            <span>Item Name</span>
            <input name="itemName" value={form.itemName} onChange={updateField} placeholder="Enter item usage name" />
          </label>
          <label>
            <span>Section Name / Issued To</span>
            <input
              name="section"
              value={form.section}
              onChange={updateField}
              placeholder="Enter section"
            />
          </label>
          <label>
            <span>Wanted Mtr</span>
            <input
              name="wantedMtr"
              type="number"
              min="0.001"
              step="0.001"
              max={inward.availableQty}
              value={form.wantedMtr}
              onChange={updateField}
              placeholder="0"
            />
          </label>

          {status.error && (
            <p className="public-message error">{status.error}</p>
          )}
          {status.success && (
            <div className="public-message success">
              <p>{status.success}</p>
              <button type="button" onClick={() => downloadTransactionPdf(receipt)}>Download Outward PDF</button>
            </div>
          )}

          <button
            className="public-submit"
            disabled={status.saving || inward.availableQty <= 0}
          >
            {status.saving
              ? "Saving..."
              : inward.availableQty <= 0
                ? "Stock Fully Issued"
                : "Submit Outward"}
          </button>
        </form>
      </section>
    </main>
  );
}
