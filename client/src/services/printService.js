import { jsPDF } from "jspdf";
import QRCode from "qrcode";

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

export async function downloadTransactionPdf(record) {
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

  if (record.kind === "INWARD") {
    const qrLink = `${window.location.origin}/outward?inwardNo=${encodeURIComponent(record.referenceNo)}`;
    const qrDataUrl = await QRCode.toDataURL(qrLink, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    pdf.addImage(qrDataUrl, "PNG", 145, 45, 48, 48);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Scan for Outward Entry", 151, 98);
  }

  pdf.save(`${referenceNo}.pdf`);
}

export function downloadDcPdf(report) {
  if (!report) return;
  const pdf = new jsPDF({ orientation: "landscape" });
  const columns = [12, 25, 62, 100, 181, 216, 246];
  const widths = [10, 34, 35, 76, 30, 27, 36];
  const headers = [
    "S.No", "Outward No", "Inward No", "Item Description",
    "Item Code", "Colour", "Quantity",
  ];

  function drawTableHeader(y) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    headers.forEach((header, index) => pdf.text(header, columns[index], y));
    pdf.line(10, y + 3, 287, y + 3);
    pdf.setFont("helvetica", "normal");
    return y + 10;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text("Accessories Flow", 15, 17);
  pdf.setFontSize(13);
  pdf.text("DC OUTWARD STATEMENT", 15, 27);
  pdf.setFontSize(10);
  pdf.text(`DC No: ${report.dcNo}`, 15, 38);
  pdf.text(`Date: ${new Date(report.date).toLocaleDateString()}`, 100, 38);
  pdf.text(`Item Name: ${report.itemNames.join(", ")}`, 15, 47, {
    maxWidth: 125,
  });
  pdf.text(`Section Name: ${report.sectionNames.join(", ") || "-"}`, 150, 47, {
    maxWidth: 130,
  });
  pdf.text("Size: __________________________", 15, 57);

  let y = 70;
  y = drawTableHeader(y);

  report.entries.forEach((entry, index) => {
    const values = [
      index + 1, entry.referenceNo, entry.inwardReference || "-",
      entry.description, entry.itemCode, entry.colour || "-",
      `${entry.quantity} ${entry.unit || ""}`,
    ];
    const wrapped = values.map((value, columnIndex) =>
      pdf.splitTextToSize(String(value), widths[columnIndex]),
    );
    const rowHeight = Math.max(...wrapped.map((lines) => lines.length)) * 4.5 + 4;

    if (y + rowHeight > 185) {
      pdf.addPage();
      y = drawTableHeader(20);
    }
    wrapped.forEach((lines, columnIndex) => {
      const centered = columnIndex === 0 || columnIndex === 5 || columnIndex === 6;
      pdf.text(lines, centered ? columns[columnIndex] + widths[columnIndex] / 2 : columns[columnIndex], y + 4, {
        align: centered ? "center" : "left",
      });
    });
    pdf.line(10, y + rowHeight, 287, y + rowHeight);
    y += rowHeight;
  });

  if (y + 70 > 200) {
    pdf.addPage();
    y = 20;
  }
  pdf.line(10, y, 287, y);
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
