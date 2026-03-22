"use client";
import { useState, useEffect } from "react";
import { roleApi } from "@/lib/api";

const ALL_PERMISSIONS = ["doc:read", "doc:write", "doc:delete", "chat:use"];

const PERM_LABELS: Record<string, string> = {
  "doc:read":   "Xem tai lieu",
  "doc:write":  "Sua tai lieu",
  "doc:delete": "Xoa tai lieu",
  "chat:use":   "Su dung Chat",
};

const DEFAULT_FORM = { name: "", description: "", permissions: [] as string[] };

export default function RolesTab() {
  const [roles, setRoles]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{msg:string;type:"success"|"error"}|null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const fetchRoles = async () => {
    try {
      const r = await roleApi.list();
      setRoles(r.data.data || r.data);
    } catch { showToast("Khong the tai roles","error"); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchRoles(); },[]);

  const togglePerm = (p: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter(x=>x!==p)
        : [...f.permissions, p]
    }));
  };

  const handleEdit = (role: any) => {
    setEditingId(role._id);
    setForm({ name: role.name, description: role.description||"", permissions: role.permissions });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false); setEditingId(null); setForm(DEFAULT_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("Ten role khong duoc de trong","error");
    setSaving(true);
    try {
      if (editingId) {
        await roleApi.update(editingId, form);
        showToast("Da cap nhat role");
      } else {
        await roleApi.create({ name: form.name, permissions: form.permissions as any, description: form.description });
        showToast("Da tao role moi");
      }
      handleCancel();
      fetchRoles();
    } catch (e: any) {
      showToast(e.response?.data?.message||"That bai","error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xoa role "${name}"?`)) return;
    try {
      await roleApi.delete(id);
      showToast("Da xoa role");
      fetchRoles();
    } catch (e: any) {
      showToast(e.response?.data?.message||"Xoa that bai","error");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type==="success"?"bg-green-500":"bg-red-500"
        }`}>{toast.msg}</div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{roles.length} roles trong he thong</p>
        {!showForm && (
          <button onClick={()=>setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Tao role moi
          </button>
        )}
      </div>

      {/* Form tao/sua role */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? "Chinh sua role" : "Tao role moi"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Ten role *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                  placeholder="vd: Reviewer, Analyst..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Mo ta</label>
                <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  placeholder="Mu ta ngan ve role nay..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    form.permissions.includes(p)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}>
                    <input type="checkbox" checked={form.permissions.includes(p)}
                      onChange={()=>togglePerm(p)} className="accent-blue-600"/>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{PERM_LABELS[p]}</p>
                      <p className="text-xs text-gray-400 font-mono">{p}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                {saving ? "Dang luu..." : editingId ? "Luu thay doi" : "Tao role"}
              </button>
              <button type="button" onClick={handleCancel}
                className="text-gray-600 hover:bg-gray-100 text-sm px-4 py-2 rounded-lg transition-colors">
                Huy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sach roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role: any) => (
          <div key={role._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{role.name}</h3>
                {role.description && <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={()=>handleEdit(role)}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg transition-colors">
                  Sua
                </button>
                <button onClick={()=>handleDelete(role._id, role.name)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2.5 py-1 rounded-lg transition-colors">
                  Xoa
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.length === 0
                ? <span className="text-xs text-gray-400 italic">Chua co quyen nao</span>
                : role.permissions.map((p: string) => (
                  <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                    {p}
                  </span>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}