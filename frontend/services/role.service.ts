import { API_BASE_URL } from "@/lib/app-config";

const API_URL = `${API_BASE_URL}/roles`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

async function parseResponse(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Không thể xử lý Role");
  return result;
}

export const RoleAPI = {
  getRoles: async () => parseResponse(await fetch(API_URL, { headers: headers() })),
  getPermissions: async () => parseResponse(await fetch(`${API_URL}/permissions`, { headers: headers() })),
  createRole: async (data: any) => parseResponse(await fetch(API_URL, { method: "POST", headers: headers(), body: JSON.stringify(data) })),
  updateRole: async (id: string, data: any) => parseResponse(await fetch(`${API_URL}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) })),
  deleteRole: async (id: string) => parseResponse(await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: headers() })),
};
