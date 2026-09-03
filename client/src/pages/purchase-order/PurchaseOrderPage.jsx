import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, exportCsv } from "../../api.js";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import Card from "../../components/common/Card.jsx";
import Field from "../../components/common/Field.jsx";
import FormActions from "../../components/common/FormActions.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import {
  formatDate,
  formatInputDate,
  formatLabel,
} from "../../utils/formatters.js";

const emptyPurchaseOrder = {
  poNo: "",
  itemCode: "",
  brand: "",
  description: "",
  category: "Uncategorized",
  type: "",
  colour: "",
  unit: "MTR",
  indentNo: "",
  indentDate: "",
  poDate: "",
  deliveryDate: "",
  orderQty: 0,
  inwardQty: 0,
  status: "Open",
};

export default function PurchaseOrderPage({ pending, notify }) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form, setForm] = useState(emptyPurchaseOrder);

  function loadPurchaseOrders() {
    api(`/pos${pending ? "?pending=true" : ""}`).then(setPurchaseOrders);
  }

  useEffect(loadPurchaseOrders, [pending]);

  function openEdit(order) {
    setEditingOrder(order);
    setForm({
      ...order,
      indentDate: formatInputDate(order.indentDate),
      poDate: formatInputDate(order.poDate),
      deliveryDate: formatInputDate(order.deliveryDate),
    });
  }

  async function savePurchaseOrder(event) {
    event.preventDefault();
    const path = editingOrder._id ? `/pos/${editingOrder._id}` : "/pos";

    await api(path, {
      method: editingOrder._id ? "PUT" : "POST",
      body: JSON.stringify(form),
    });

    setEditingOrder(null);
    loadPurchaseOrders();
    notify("Purchase order saved");
  }

  async function deletePurchaseOrder(order) {
    if (!confirm(`Delete ${order.poNo}?`)) return;
    await api(`/pos/${order._id}`, { method: "DELETE" });
    loadPurchaseOrders();
  }

  const columns = [
    { key: "poNo", label: "PO no." },
    { key: "itemCode", label: "Item code" },
    { key: "orderQty", label: "Order qty" },
    { key: "inwardQty", label: "Inward qty" },
    {
      key: "pendingQty",
      label: "Pending",
      render: (order) => Math.max(0, order.orderQty - order.inwardQty),
    },
    {
      key: "deliveryDate",
      label: "Delivery",
      render: (order) => formatDate(order.deliveryDate),
    },
    { key: "status", label: "Status" },
  ];

  const action = (
    <div className="actions">
      <button onClick={() => exportCsv("purchase-orders.csv", purchaseOrders)}>
        Export CSV
      </button>
      {!pending && (
        <button
          className="primary"
          onClick={() => {
            setEditingOrder({});
            setForm(emptyPurchaseOrder);
          }}
        >
          <Plus /> New PO
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageTitle
        title={pending ? "PO pending" : "Purchase orders"}
        subtitle="Order, delivery and inward balance details"
        action={action}
      />

      <Card>
        <DataTable
          columns={columns}
          rows={purchaseOrders}
          onEdit={pending ? null : openEdit}
          onDelete={pending ? null : deletePurchaseOrder}
        />
      </Card>

      {editingOrder && (
        <Modal
          title={editingOrder._id ? "Edit PO" : "New PO"}
          onClose={() => setEditingOrder(null)}
        >
          <form className="form-grid" onSubmit={savePurchaseOrder}>
            {Object.keys(emptyPurchaseOrder).map((key) => (
              <Field key={key} label={formatLabel(key)}>
                {key === "status" ? (
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    {["Open", "Part received", "Completed", "Cancelled"].map(
                      (status) => (
                        <option key={status}>{status}</option>
                      ),
                    )}
                  </select>
                ) : (
                  <input
                    required={[
                      "poNo",
                      "itemCode",
                      "deliveryDate",
                      "orderQty",
                    ].includes(key)}
                    type={
                      key.toLowerCase().includes("date")
                        ? "date"
                        : ["orderQty", "inwardQty"].includes(key)
                          ? "number"
                          : "text"
                    }
                    value={form[key] ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                  />
                )}
              </Field>
            ))}
            <FormActions onCancel={() => setEditingOrder(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
