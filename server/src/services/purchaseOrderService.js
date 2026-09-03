import ApiError from "../utils/ApiError.js";
import { purchaseOrderRepository } from "../repositories/purchaseOrderRepository.js";
import Item from "../models/Item.js";

export const purchaseOrderService = {
  getPurchaseOrders: (pendingOnly) => {
    const filter = pendingOnly
      ? { status: { $in: ["Open", "Part received"] } }
      : {};

    return purchaseOrderRepository.findAll(filter);
  },

  createPurchaseOrder: async (purchaseOrderData) => {
    const itemCode = purchaseOrderData.itemCode.trim().toUpperCase();
    let item = await Item.findOne({ itemCode });

    if (!item) {
      item = await Item.create({
        itemCode,
        brand: purchaseOrderData.brand || "",
        description: purchaseOrderData.description || itemCode,
        category: purchaseOrderData.category || "Uncategorized",
        type: purchaseOrderData.type || "",
        colour: purchaseOrderData.colour || "",
        unit: purchaseOrderData.unit || "MTR",
      });
    }

    return purchaseOrderRepository.create({ ...purchaseOrderData, itemCode });
  },

  updatePurchaseOrder: async (purchaseOrderId, purchaseOrderData) => {
    const purchaseOrder = await purchaseOrderRepository.update(
      purchaseOrderId,
      purchaseOrderData,
    );

    if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");
    return purchaseOrder;
  },

  deletePurchaseOrder: async (purchaseOrderId) => {
    const purchaseOrder = await purchaseOrderRepository.remove(purchaseOrderId);
    if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");
  },
};
