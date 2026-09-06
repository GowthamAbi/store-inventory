import { request } from "./axiosInstance.js";

export const getProductionSummary = () => request("/production/summary");
export const getMachines = () => request("/production/machines");
export const saveMachine = (data, id) => request(`/production/machines${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(data) });
export const getEmployees = () => request("/production/employees");
export const saveEmployee = (data, id) => request(`/production/employees${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(data) });
export const getJobs = () => request("/production/jobs");
export const startProductionJob = (data) => request("/production/jobs/start", { method: "POST", body: JSON.stringify(data) });
export const stopProductionJob = (id, data) => request(`/production/jobs/${id}/stop`, { method: "PATCH", body: JSON.stringify(data) });
export const resumeProductionJob = (id) => request(`/production/jobs/${id}/resume`, { method: "PATCH" });
export const getPendingIssues = () => request("/production/pending");
export const savePendingIssue = (data, id) => request(`/production/pending${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(data) });
export const changePendingStatus = (id, status) => request(`/production/pending/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const getSewingDeliveries = () => request("/production/sewing");
export const createSewingDelivery = (data) => request("/production/sewing", { method: "POST", body: JSON.stringify(data) });
