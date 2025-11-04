const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api";

export async function fetchItems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/items?${qs}`);
  return res.json();
}

export async function createItem(payload) {
  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function patchItem(id, payload) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
  return res;
}

export async function markSold(id, payload) {
  const res = await fetch(`${API_BASE}/items/${id}/mark-sold`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function toggleActiveApi(id) {
  const res = await fetch(`${API_BASE}/items/${id}/toggle-active`, {
    method: "PATCH"
  });
  return res.json();
}
