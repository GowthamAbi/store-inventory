import ApiError from "../utils/ApiError.js";
import { itemRepository } from "../repositories/itemRepository.js";

export const itemService = {
  getItems: () => itemRepository.findAll(),

  getItemByCode: async (itemCode) => {
    const item = await itemRepository.findByCode(itemCode);
    if (!item) throw new ApiError(404, "Item code not found");
    return item;
  },

  createItem: (itemData) => itemRepository.create(itemData),

  updateItem: async (itemId, itemData) => {
    const item = await itemRepository.update(itemId, itemData);
    if (!item) throw new ApiError(404, "Item not found");
    return item;
  },

  deleteItem: async (itemId) => {
    const item = await itemRepository.remove(itemId);
    if (!item) throw new ApiError(404, "Item not found");
  },
};
