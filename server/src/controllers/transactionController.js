import { createInward, createOutward } from "../services/stockService.js";
import { transactionRepository } from "../repositories/transactionRepository.js";
import Transaction from "../models/Transaction.js";
import Item from "../models/Item.js";
import ApiError from "../utils/ApiError.js";

export async function getTransactions(request, response) {
  const filter = {};

  if (request.query.kind) filter.kind = request.query.kind;
  if (request.query.itemCode) {
    filter.itemCode = request.query.itemCode.toUpperCase();
  }

  if (request.query.from || request.query.to) {
    filter.transactionDate = {
      ...(request.query.from && { $gte: new Date(request.query.from) }),
      ...(request.query.to && { $lte: new Date(request.query.to) }),
    };
  }

  response.json(await transactionRepository.findAll(filter));
}

export async function saveInward(request, response) {
  response.status(201).json(await createInward(request.body));
}

export async function saveOutward(request, response) {
  response.status(201).json(await createOutward(request.body));
}

export async function getTransactionByReference(request, response) {
  const referenceNo = request.params.referenceNo.toUpperCase();
  const transaction = await Transaction.findOne({ referenceNo }).lean();
  if (!transaction) {
    throw new ApiError(404, "Inward or outward number not found");
  }

  const item = await Item.findOne({ itemCode: transaction.itemCode }).lean();
  response.json({
    ...transaction,
    itemName: transaction.itemName || item?.description || transaction.itemCode,
    description: item?.description || "",
    brand: item?.brand || "",
    type: item?.type || "",
    colour: item?.colour || "",
    unit: item?.unit || "",
  });
}

export async function getOutwardsByDcNo(request, response) {
  const dcNo = request.params.dcNo.trim();
  const transactions = await Transaction.find({
    kind: "OUTWARD",
    dcNo: {
      $regex: `^${dcNo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
  })
    .sort({ transactionDate: 1 })
    .lean();

  if (!transactions.length) {
    throw new ApiError(404, "No outward entries found for this DC number");
  }

  const itemCodes = [...new Set(transactions.map((entry) => entry.itemCode))];
  const items = await Item.find({ itemCode: { $in: itemCodes } }).lean();
  const itemMap = new Map(items.map((item) => [item.itemCode, item]));

  const entries = transactions.map((entry, index) => {
    const item = itemMap.get(entry.itemCode);
    return {
      ...entry,
      serialNo: index + 1,
      itemName: entry.itemName || item?.description || entry.itemCode,
      unit: item?.unit || "",
    };
  });

  response.json({
    dcNo: transactions[0].dcNo,
    date: transactions[0].transactionDate,
    itemNames: [...new Set(entries.map((entry) => entry.itemName))],
    totalQuantity: entries.reduce((total, entry) => total + entry.quantity, 0),
    entries,
  });
}
