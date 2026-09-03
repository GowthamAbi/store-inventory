import { jsPDF } from "jspdf";

function rowsFor(record) {
  return [
    ["Reference No", record.referenceNo || record.outwardNo || record.inwardNo],
    ["Transaction", record.kind || "OUTWARD"],
    ["Inward Reference", record.inwardReference || record.inwardNo || "-"],
    ["PO No", record.poNo || "-"],
    ["Item Code", record.itemCode || "-"],
    ["Item Name / Usage", record.itemName || record.description || "-"],
    ["Brand", record.brand || "-"],
    ["Type", record.type || "-"],
    ["Colour", record.colour || "-"],
    ["DC No", record.dcNo || "-"],
    ["Section Name", record.section || "-"],
    [
      "Quantity",
      `${record.quantity ?? record.issuedQty ?? "-"} ${record.unit || ""}`,
    ],
    [
      "Balance",
      `${record.balanceQty ?? record.availableQty ?? "-"} ${record.unit || ""}`,
    ],
    [
      "Date",
      new Date(
        record.transactionDate || record.createdAt || Date.now(),
      ).toLocaleString(),
    ],
  ];
}

export function downloadTransactionPdf(record) {
  if (!record) return;
  const referenceNo = record.referenceNo || record.outwardNo || record.inwardNo;
  const pdf = new jsPDF();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Accessories Flow", 18, 20);
  pdf.setFontSize(14);
  pdf.text(`${record.kind || "OUTWARD"} RECEIPT`, 18, 31);
  pdf.setDrawColor(24, 130, 103);
  pdf.line(18, 36, 192, 36);

  let y = 47;
  rowsFor(record).forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(label, 18, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(value), 72, y);
    y += 10;
  });
  pdf.save(`${referenceNo}.pdf`);
}

export function downloadDcPdf(report) {
  if (!report) return;
  const pdf = new jsPDF({ orientation: "landscape" });
  const columns = [15, 28, 62, 101, 132, 190, 240];

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text("Accessories Flow", 15, 17);
  pdf.setFontSize(13);
  pdf.text("DC OUTWARD STATEMENT", 15, 27);
  pdf.setFontSize(10);
  pdf.text(`DC No: ${report.dcNo}`, 15, 38);
  pdf.text(`Date: ${new Date(report.date).toLocaleDateString()}`, 100, 38);
  pdf.text(`Item Name: ${report.itemNames.join(", ")}`, 15, 47, {
    maxWidth: 265,
  });

  let y = 61;
  const headers = [
    "S.No",
    "Outward No",
    "Inward Reference",
    "Item Code",
    "Item Name",
    "Section",
    "Quantity",
  ];
  headers.forEach((header, index) => pdf.text(header, columns[index], y));
  pdf.line(15, y + 3, 282, y + 3);
  y += 11;
  pdf.setFont("helvetica", "normal");

  report.entries.forEach((entry, index) => {
    if (y > 180) {
      pdf.addPage();
      y = 20;
    }
    const values = [
      index + 1,
      entry.referenceNo,
      entry.inwardReference || "-",
      entry.itemCode,
      entry.itemName,
      entry.section || "-",
      `${entry.quantity} ${entry.unit || ""}`,
    ];
    values.forEach((value, columnIndex) =>
      pdf.text(String(value), columns[columnIndex], y, {
        maxWidth: columnIndex === 4 ? 54 : 38,
      }),
    );
    y += 9;
  });

  pdf.line(15, y, 282, y);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Total: ${report.totalQuantity}`, 240, y + 9);
  pdf.text("Remarks:", 15, y + 19);
  pdf.line(15, y + 34, 282, y + 34);
  pdf.line(15, y + 45, 282, y + 45);
  pdf.text("Prepared By", 25, y + 67);
  pdf.text("Checked By", 125, y + 67);
  pdf.text("Authorized By", 230, y + 67);
  pdf.save(`${report.dcNo}-outward.pdf`);
}

export const printTransaction = () => window.print();
export const printCurrentPage = printTransaction;
