"use client";
import { useState, useEffect } from "react";
import { authApi, roleApi } from "@/lib/api";

export default function UsersTab() {
  const [users, setUsers]   = useState<any[]>([]);
  const [roles, setRoles]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState<{msg:string;type:"success"|"error"}|null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [u, r] = await Promise.all([authApi.listUsers(), roleApi.list()]);
      setUsers(u.data.data || u.data);
      setRoles(r.data.data || r.data);
    } catch { showToast("Khong the tai du lieu", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await authApi.assignRole(userId, roleId === "none" ? null : roleId);
      showToast("Da cap nhat role");
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || "That bai", "error");
    }
  };

  const handleSetSystemRole = async (userId: string, role: string) => {
    try {
      await authApi.setSystemRole(userId, role);
      showToast("Da cap nhat system role");
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || "That bai", "error");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>{toast.msg}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Danh sach nguoi dung ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Ho ten</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">System Role</th>
                <th className="text-left px-5 py-3 font-medium">Custom Role</th>
                <th className="text-left px-5 py-3 font-medium">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={e => handleSetSystemRole(u._id, e.target.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        u.role === "admin"
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.customRoleId?._id || u.customRoleId || "none"}
                      onChange={e => handleAssignRole(u._id, e.target.value)}
                      disabled={u.role === "admin"}
                      className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed min-w-[120px]"
                    >
                      <option value="none">-- Chua co --</option>
                      {roles.map((r: any) => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {u.isActive ? "Hoat dong" : "Bi khoa"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}