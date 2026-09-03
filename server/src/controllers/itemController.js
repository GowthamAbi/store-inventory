import { itemService } from "../services/itemService.js";

export async function getItems(_request, response) {
  response.json(await itemService.getItems());
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
