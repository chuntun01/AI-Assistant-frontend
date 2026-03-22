"use client";
import { useState, useEffect } from "react";
import { docApi, authApi } from "@/lib/api";

interface Props {
  doc: { _id: string; originalName: string };
  onClose: () => void;
}

export default function ShareModal({ doc, onClose }: Props) {
  const [users, setUsers]     = useState<any[]>([]);
  const [perms, setPerms]     = useState<any[]>([]);
  const [form, setForm]       = useState({ userId: "", level: "view" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        authApi.listUsers(),
        docApi.getPermissions(doc._id),
      ]);
      setUsers((u.data.data || u.data).filter((x: any) => x.role !== "admin"));
      setPerms(p.data.data || []);
    } catch {
      showToast("Khong the tai du lieu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId) return;
    setSaving(true);
    try {
      await docApi.grantPermission(doc._id, form.userId, form.level);
      showToast("Da cap quyen thanh cong");
      setForm({ userId: "", level: "view" });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "That bai", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (targetUserId: string, name: string) => {
    if (!confirm(`Thu hoi quyen cua "${name}"?`)) return;
    try {
      await docApi.revokePermission(doc._id, targetUserId);
      showToast("Da thu hoi quyen");
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "That bai", "error");
    }
  };

  // Users chua duoc cap quyen
  const unsharedUsers = users.filter(
    u => !perms.some((p: any) => (p.userId?._id || p.userId) === u._id)
  );

  return (
    <div
      style={{ minHeight: 400, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, width: "100%", maxWidth: 520, overflow: "hidden", border: "1px solid var(--color-border-tertiary)" }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", top: 16, right: 16, zIndex: 100,
            padding: "10px 16px", borderRadius: 10,
            background: toast.type === "success" ? "#22c55e" : "#ef4444",
            color: "#fff", fontSize: 13, fontWeight: 500,
          }}>{toast.msg}</div>
        )}

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 500, color: "var(--color-text-primary)", fontSize: 15 }}>Chia se tai lieu</p>
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }} title={doc.originalName}>
              {doc.originalName.length > 50 ? doc.originalName.substring(0, 50) + "..." : doc.originalName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-tertiary)", lineHeight: 1 }}>Ã—</button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* Form cap quyen */}
              <form onSubmit={handleGrant} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <select
                  value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value })}
                  style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }}
                >
                  <option value="">-- Chon nguoi dung --</option>
                  {unsharedUsers.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  style={{ padding: "8px 10px", border: "1px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }}
                >
                  <option value="view">Chi xem</option>
                  <option value="edit">Co the sua</option>
                </select>
                <button
                  type="submit"
                  disabled={saving || !form.userId}
                  style={{ padding: "8px 16px", background: saving || !form.userId ? "var(--color-border-secondary)" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: saving || !form.userId ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                >
                  {saving ? "..." : "Cap quyen"}
                </button>
              </form>

              {/* Danh sach da cap quyen */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  Dang duoc truy cap ({perms.length})
                </p>

                {perms.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13, padding: "16px 0" }}>
                    Chua chia se cho ai
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {perms.map((perm: any) => {
                      const user = perm.userId;
                      const userId = user?._id || user;
                      const name = user?.name || "?";
                      const email = user?.email || "";
                      return (
                        <div key={perm._id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "8px 12px", background: "var(--color-background-secondary)",
                          borderRadius: 8, border: "1px solid var(--color-border-tertiary)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: "var(--color-background-info)",
                              color: "var(--color-text-info)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 700, flexShrink: 0,
                            }}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{name}</p>
                              <p style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{email}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 500,
                              background: perm.level === "edit" ? "var(--color-background-warning)" : "var(--color-background-info)",
                              color: perm.level === "edit" ? "var(--color-text-warning)" : "var(--color-text-info)",
                            }}>
                              {perm.level === "edit" ? "Co the sua" : "Chi xem"}
                            </span>
                            <button
                              onClick={() => handleRevoke(userId, name)}
                              style={{ fontSize: 11, padding: "3px 10px", background: "var(--color-background-danger)", color: "var(--color-text-danger)", border: "none", borderRadius: 6, cursor: "pointer" }}
                            >
                              Thu hoi
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}