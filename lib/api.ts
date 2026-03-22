import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  register: (data: { email: string; password: string; name: string }) => api.post("/auth/register", data),
  login:    (data: { email: string; password: string })               => api.post("/auth/login", data),
  me:       ()                                                         => api.get("/auth/me"),
  listUsers: ()                                                        => api.get("/auth/users"),
  setSystemRole: (id: string, role: string)  => api.patch(`/auth/users/${id}/system-role`, { role }),
  assignRole:    (id: string, roleId: string | null) => api.patch(`/auth/users/${id}/role`, { roleId }),
};

export const roleApi = {
  list:   ()                                                                   => api.get("/auth/roles"),
  create: (data: { name: string; permissions: string[]; description?: string }) => api.post("/auth/roles", data),
  update: (id: string, data: any)                                              => api.patch(`/auth/roles/${id}`, data),
  delete: (id: string)                                                         => api.delete(`/auth/roles/${id}`),
  getPermissions: ()                                                           => api.get("/auth/roles/permissions"),
};

export const docApi = {
  list:          ()                         => api.get("/documents"),
  listAll:       ()                         => api.get("/documents/admin/all"),
  get:           (id: string)               => api.get(`/documents/${id}`),
  upload:        (form: FormData)           => api.post("/documents/upload", form),
  delete:        (id: string)               => api.delete(`/documents/${id}`),
  embed:         (id: string)               => api.post(`/chat/embed/${id}`),
  setVisibility: (id: string, v: string)    => api.patch(`/documents/${id}/visibility`, { visibility: v }),
  getPermissions:  (id: string)             => api.get(`/documents/${id}/permissions`),
  grantPermission: (id: string, targetUserId: string, level: string) =>
    api.post(`/documents/${id}/permissions/grant`, { targetUserId, level }),
  revokePermission: (id: string, targetUserId: string) =>
    api.post(`/documents/${id}/permissions/revoke`, { targetUserId }),
};

export const chatApi = {
  getSessions:   ()           => api.get("/chat/sessions"),
  getSession:    (id: string) => api.get(`/chat/sessions/${id}`),
  deleteSession: (id: string) => api.delete(`/chat/sessions/${id}`),
};