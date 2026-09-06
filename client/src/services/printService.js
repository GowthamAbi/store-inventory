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
  const pdf = new jsPDF({ orientation: "landscape" });
  const columns = [12, 25, 62, 100, 181, 216, 246];
  const widths = [10, 34, 35, 76, 30, 27, 36];
  const headers = [
    "S.No", "Outward No", "Inward No", "Item Description",
    "Item Code", "Colour", "Quantity",
  ];
  const colours = [...new Set(report.entries.map((entry) => entry.colour || "UNSPECIFIED"))];
  const qrItems = [{ label: "MAIN DC", colour: "" }, ...colours.map((colour) => ({ label: colour, colour }))];
  const qrSize = qrItems.length > 7 ? 11 : 16;
  const qrColumns = 7;
  const qrRows = Math.ceil(qrItems.length / qrColumns);
  const qrBlockHeight = qrRows * (qrSize + 7) + 5;

  function drawTableHeader(y, fontSize = 8) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(fontSize);
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

  const preparedRows = report.entries.map((entry, index) => {
    const values = [index + 1, entry.referenceNo, entry.inwardReference || "-", entry.description, entry.itemCode, entry.colour || "-", `${entry.quantity} ${entry.unit || ""}`];
    const wrapped = values.map((value, columnIndex) => pdf.splitTextToSize(String(value), widths[columnIndex]));
    return { wrapped, lineCount: Math.max(...wrapped.map((lines) => lines.length)) };
  });
  const totalLines = preparedRows.reduce((sum, row) => sum + row.lineCount, 0) || 1;
  const rowSpacing = preparedRows.length > 20 ? 0.7 : 1.2;
  const lineHeight = Math.max(
    0.75,
    Math.min(4, (68 - qrBlockHeight - preparedRows.length * rowSpacing) / totalLines),
  );
  const tableFontSize = Math.max(4, Math.min(8, lineHeight * 2));
  let y = drawTableHeader(68, tableFontSize);
  pdf.setFontSize(tableFontSize);

  preparedRows.forEach(({ wrapped, lineCount }) => {
    const rowHeight = lineCount * lineHeight + rowSpacing;
    wrapped.forEach((lines, columnIndex) => {
      const centered = columnIndex === 0 || columnIndex === 5 || columnIndex === 6;
      pdf.text(lines, centered ? columns[columnIndex] + widths[columnIndex] / 2 : columns[columnIndex], y + lineHeight, {
        lineHeightFactor: 1,
        align: centered ? "center" : "left",
      });
    });
    pdf.line(10, y + rowHeight, 287, y + rowHeight);
    y += rowHeight;
  });

  pdf.line(10, y, 287, y);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(`Total: ${report.totalQuantity}`, 240, y + 5);

  let qrY = y + 8;
  for (let index = 0; index < qrItems.length; index += 1) {
    const item = qrItems[index];
    const column = index % qrColumns;
    const row = Math.floor(index / qrColumns);
    const x = 14 + column * 39;
    const currentY = qrY + row * (qrSize + 7);
    const url = `${window.location.origin}/production?dcNo=${encodeURIComponent(report.dcNo)}${item.colour ? `&colour=${encodeURIComponent(item.colour)}` : ""}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 1, errorCorrectionLevel: "M" });
    pdf.addImage(dataUrl, "PNG", x, currentY, qrSize, qrSize);
    pdf.setFontSize(6.5);
    pdf.text(item.label, x + qrSize / 2, currentY + qrSize + 3, { align: "center", maxWidth: 35 });
  }

  const footerY = Math.min(157, qrY + qrRows * (qrSize + 7) + 2);
  pdf.setFontSize(9);
  pdf.text("Remarks:", 15, footerY);
  pdf.line(15, footerY + 9, 282, footerY + 9);
  pdf.line(15, footerY + 17, 282, footerY + 17);
  pdf.text("Prepared By", 25, footerY + 36);
  pdf.text("Checked By", 125, footerY + 36);
  pdf.text("Authorized By", 230, footerY + 36);
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
