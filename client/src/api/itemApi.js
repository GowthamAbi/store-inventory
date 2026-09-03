import { request } from "./axiosInstance.js";
export const getItems = () => request("/items");
export const getItem = (code) => request(`/items/${code}`);
export const createItem = (data) =>
  request("/items", { method: "POST", body: JSON.stringify(data) });
export const updateItem = (id, data) =>
  request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteItem = (id) => request(`/items/${id}`, { method: "DELETE" });
