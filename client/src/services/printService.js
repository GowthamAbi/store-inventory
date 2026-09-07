import { jsPDF } from "jspdf";
import QRCode from "qrcode";

function rowsFor(record) {
  return [
    ["Reference No", record.referenceNo || record.outwardNo || record.inwardNo],
    ["Transaction", record.kind || "OUTWARD"],
    ["Inward Reference", record.inwardReference || record.inwardNo || "-"],
    ["PO No", record.poNo || "-"],
    ["Indent No", record.indentNo || "-"],
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
  const isInward = record.kind === "INWARD";
  const pdf = isInward
    ? new jsPDF({ orientation: "landscape", format: "a5" })
    : new jsPDF();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(isInward ? 17 : 20);
  pdf.text("Accessories Flow", 14, 16);
  pdf.setFontSize(isInward ? 11 : 14);
  pdf.text(`${record.kind || "OUTWARD"} RECEIPT`, 14, 25);
  pdf.setDrawColor(24, 130, 103);
  pdf.line(14, 29, 196, 29);

  let y = 38;
  rowsFor(record).forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(isInward ? 8 : 10);
    pdf.text(label, 14, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(value), isInward ? 54 : 72, y, { maxWidth: isInward ? 82 : 120 });
    y += isInward ? 6.8 : 10;
  });

  if (record.kind === "INWARD") {
    const qrLink = `${window.location.origin}/outward?inwardNo=${encodeURIComponent(record.referenceNo)}`;
    const qrDataUrl = await QRCode.toDataURL(qrLink, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    pdf.addImage(qrDataUrl, "PNG", 151, 38, 45, 45);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Scan for Outward Entry", 153, 88);
  }

  pdf.save(`${referenceNo}.pdf`);
}

export async function downloadDcPdf(report) {
  if (!report) return;
  const pdf = new jsPDF({ orientation: "landscape", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const columns = [12, 27, 112, 157, 197, 224];
  const widths = [15, 85, 45, 40, 27, 61];
  const headers = ["S.No", "Description", "Item Code", "Colour", "QR", "Quantity"];
  const manyRows = report.entries.length > 12;
  const fontSize = manyRows ? 6 : 7.5;
  const qrSize = manyRows ? 5.5 : 7.5;
  const minimumRowHeight = manyRows ? 7 : 9.5;

  const mainQrUrl = `${window.location.origin}/production?dcNo=${encodeURIComponent(report.dcNo)}`;
  const mainQrData = await QRCode.toDataURL(mainQrUrl, {
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const rowQrData = await Promise.all(
    report.entries.map((entry) => {
      const url =
        `${window.location.origin}/production?dcNo=${encodeURIComponent(report.dcNo)}` +
        `&outwardNo=${encodeURIComponent(entry.referenceNo || "")}` +
        `&inwardNo=${encodeURIComponent(entry.inwardReference || "")}` +
        `&colour=${encodeURIComponent(entry.colour || "")}`;
      return QRCode.toDataURL(url, {
        width: 260,
        margin: 1,
        errorCorrectionLevel: "M",
      });
    }),
  );

  pdf.setFillColor(18, 92, 75);
  pdf.rect(0, 0, pageWidth, 5, "F");
  pdf.setTextColor(18, 60, 51);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text("Accessories Flow", 14, 18);
  pdf.setFontSize(10);
  pdf.setTextColor(70, 91, 85);
  pdf.text("DC OUTWARD STATEMENT", 14, 27);

  pdf.addImage(mainQrData, "PNG", pageWidth / 2 - 13, 7, 26, 26);
  pdf.setFontSize(6.5);
  pdf.setTextColor(18, 60, 51);
  pdf.text("MAIN DC QR", pageWidth / 2, 36, { align: "center" });

  pdf.setFontSize(9);
  pdf.text(`DC No: ${report.dcNo}`, 220, 17);
  pdf.text(`Date: ${new Date(report.date).toLocaleDateString()}`, 220, 27);
  pdf.setDrawColor(24, 130, 103);
  pdf.setLineWidth(0.5);
  pdf.line(12, 41, 285, 41);

  pdf.setFillColor(244, 249, 247);
  pdf.roundedRect(12, 45, 273, 12, 2, 2, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(18, 60, 51);
  pdf.text(`Item Name: ${report.itemNames.join(", ") || "-"}`, 16, 52, { maxWidth: 92 });
  pdf.text(`Section: ${report.sectionNames.join(", ") || "-"}`, 112, 52, { maxWidth: 82 });
  pdf.text("Size: __________________", 218, 52);

  let y = 61;
  const headerHeight = 9;
  pdf.setFillColor(18, 92, 75);
  pdf.rect(12, y, 273, headerHeight, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  headers.forEach((header, index) => {
    const center = columns[index] + widths[index] / 2;
    pdf.text(header, center, y + 5.8, { align: "center" });
  });
  y += headerHeight;

  pdf.setTextColor(25, 45, 40);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  report.entries.forEach((entry, index) => {
    const values = [
      String(index + 1),
      entry.description || entry.itemCode,
      entry.itemCode || "-",
      entry.colour || "-",
      "",
      `${entry.quantity} ${entry.unit || ""}`,
    ];
    const wrapped = values.map((value, columnIndex) =>
      pdf.splitTextToSize(value, widths[columnIndex] - 4),
    );
    const textLines = Math.max(...wrapped.map((lines) => lines.length));
    const rowHeight = Math.max(minimumRowHeight, textLines * 3.2 + 3);

    if (index % 2 === 1) {
      pdf.setFillColor(248, 251, 250);
      pdf.rect(12, y, 273, rowHeight, "F");
    }
    pdf.setDrawColor(205, 220, 215);
    pdf.rect(12, y, 273, rowHeight);
    for (let columnIndex = 1; columnIndex < columns.length; columnIndex += 1) {
      pdf.line(columns[columnIndex], y, columns[columnIndex], y + rowHeight);
    }
    wrapped.forEach((lines, columnIndex) => {
      if (columnIndex === 4) return;
      const center = columns[columnIndex] + widths[columnIndex] / 2;
      pdf.text(lines, center, y + 4.3, {
        align: "center",
        lineHeightFactor: 1.05,
        maxWidth: widths[columnIndex] - 4,
      });
    });
    pdf.addImage(
      rowQrData[index],
      "PNG",
      columns[4] + (widths[4] - qrSize) / 2,
      y + (rowHeight - qrSize) / 2,
      qrSize,
      qrSize,
    );
    y += rowHeight;
  });

  const totalHeight = 9;
  pdf.setFillColor(231, 243, 239);
  pdf.rect(12, y, 273, totalHeight, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.text("TOTAL QUANTITY", 210, y + 5.8, { align: "right" });
  pdf.text(String(report.totalQuantity), 277, y + 5.8, { align: "right" });
  y += totalHeight + 5;

  const footerY = Math.min(y, 168);
  pdf.setFontSize(8);
  pdf.text("Remarks", 14, footerY);
  pdf.setDrawColor(130, 150, 144);
  pdf.line(14, footerY + 8, 283, footerY + 8);
  pdf.line(14, footerY + 15, 283, footerY + 15);

  const signatureLineY = 195;
  const signatures = [
    [20, 82, "Prepared By"],
    [117, 179, "Checked By"],
    [215, 277, "Authorized By"],
  ];
  signatures.forEach(([startX, endX, label]) => {
    pdf.line(startX, signatureLineY, endX, signatureLineY);
    pdf.text(label, (startX + endX) / 2, signatureLineY + 5, { align: "center" });
  });
  pdf.save(`${report.dcNo}-outward.pdf`);
}

export function printTransaction(targetId) {
  document.body.dataset.printTarget = targetId || "";
  window.requestAnimationFrame(() => {
    window.print();
    delete document.body.dataset.printTarget;
  });
}
export const printCurrentPage = printTransaction;
