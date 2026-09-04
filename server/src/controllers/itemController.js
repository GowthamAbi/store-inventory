import { itemService } from "../services/itemService.js";
import Inward from "../models/Inward.js";
import Item from "../models/Item.js";

export async function getItems(_request, response) {
  response.json(await itemService.getItems());
}

export async function getStockLots(_request, response) {
  const inwards = await Inward.find({ balanceQty: { $gt: 0 } })
    .sort({ inwardDate: -1 })
    .lean();
  const itemCodes = [...new Set(inwards.map((entry) => entry.itemCode))];
  const items = await Item.find({ itemCode: { $in: itemCodes } }).lean();
  const itemMap = new Map(items.map((item) => [item.itemCode, item]));

  response.json(
    inwards.map((inward) => {
      const item = itemMap.get(inward.itemCode) || {};
      return {
        _id: inward._id,
        inwardNo: inward.inwardNo,
        poNo: inward.poNo || "",
        indentNo: inward.indentNo || "",
        itemCode: inward.itemCode,
        description: item.description || inward.itemCode,
        brand: item.brand || "",
        type: item.type || "",
        colour: item.colour || "",
        stockQty: inward.balanceQty,
        unit: item.unit || "",
        inwardDate: inward.inwardDate,
      };
    }),
  );
}

export async function getItemByCode(request, response) {
  response.json(await itemService.getItemByCode(request.params.itemCode));
}

export async function createItem(request, response) {
  response.status(201).json(await itemService.createItem(request.body));
}

export async function updateItem(request, response) {
  response.json(
    await itemService.updateItem(request.params.itemId, request.body),
  );
}

export async function deleteItem(request, response) {
  await itemService.deleteItem(request.params.itemId);
  response.json({ message: "Item deleted successfully" });
}
