import { api } from "../api.js";

export const garmentFlowApi = {
  plans: () => api("/garment-flow/plans"),
  plan: (reference) => api("/garment-flow/plans/" + encodeURIComponent(reference)),
  createPlan: (payload) => api("/garment-flow/plans", { method: "POST", body: JSON.stringify(payload) }),
  approvePlan: (id) => api("/garment-flow/plans/" + id + "/approve", { method: "PATCH" }),
  saveActual: (planId, payload) => api("/garment-flow/plans/" + planId + "/cutting-actual", { method: "POST", body: JSON.stringify(payload) }),
  actual: (reference) => api("/garment-flow/cutting-actual/" + encodeURIComponent(reference)),
  elastic: (reference, measurements) => api("/garment-flow/elastic-requirement/" + encodeURIComponent(reference), { method: "POST", body: JSON.stringify({ measurements }) }),
  waste: () => api("/garment-flow/waste-register"),
};
