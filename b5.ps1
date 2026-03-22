# update-documents-ui.ps1
# Chay trong thu muc ai-iam-frontend
# .\update-documents-ui.ps1

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Write-File($relativePath, $content) {
    $full = Join-Path (Get-Location) $relativePath
    $dir  = Split-Path $full
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($full, $content, $utf8NoBom)
    Write-Host "  [OK] $relativePath" -ForegroundColor Green
}

Write-Host "Cap nhat Documents UI..." -ForegroundColor Cyan

# ============================================================
# components/ShareModal.tsx — modal cap/thu quyen tren 1 doc
# ============================================================
Write-File "components\ShareModal.tsx" @'
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
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-tertiary)", lineHeight: 1 }}>×</button>
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
'@

# ============================================================
# app/documents/page.tsx — phan loai doc: cua minh / duoc share
# ============================================================
Write-File "app\documents\page.tsx" @'
"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ShareModal from "@/components/ShareModal";
import { docApi } from "@/lib/api";
import { getUser } from "@/lib/auth";

const STATUS_LABEL: Record<string, string> = {
  pending: "Cho xu ly", processing: "Dang xu ly", ready: "San sang", failed: "Loi",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-gray-100 text-gray-500",
  processing: "bg-yellow-50 text-yellow-600",
  ready: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-500",
};

export default function DocumentsPage() {
  const [docs, setDocs]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"mine" | "shared">("mine");
  const [shareDoc, setShareDoc] = useState<any | null>(null);
  const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const user    = getUser();
  const isAdmin = user?.role === "admin";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDocs = async () => {
    try {
      const res = isAdmin ? await docApi.listAll() : await docApi.list();
      setDocs(res.data.data || []);
    } catch {
      showToast("Khong the tai danh sach tai lieu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  // Phan loai doc
  const myDocs     = docs.filter(d => (d.uploadedBy?._id || d.uploadedBy) === user?.id);
  const sharedDocs = docs.filter(d => (d.uploadedBy?._id || d.uploadedBy) !== user?.id);
  const visibleDocs = isAdmin ? docs : (activeTab === "mine" ? myDocs : sharedDocs);

  const uploadFile = async (file: File) => {
    if (!["application/pdf", "text/plain"].includes(file.type)) {
      return showToast("Chi ho tro PDF va TXT", "error");
    }
    if (file.size > 10 * 1024 * 1024) {
      return showToast("File khong duoc vuot qua 10MB", "error");
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await docApi.upload(form);
      showToast("Upload thanh cong! Dang xu ly...");
      setTimeout(fetchDocs, 1500);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Upload that bai", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoa tai lieu nay?")) return;
    try {
      await docApi.delete(id);
      showToast("Da xoa tai lieu");
      setDocs(prev => prev.filter(d => (d._id || d.id) !== id));
    } catch (err: any) {
      showToast(err.response?.data?.message || "Xoa that bai", "error");
    }
  };

  const handleToggleVisibility = async (doc: any) => {
    const next = doc.visibility === "private" ? "public" : "private";
    try {
      await docApi.setVisibility(doc._id || doc.id, next);
      showToast(`Da doi thanh ${next}`);
      fetchDocs();
    } catch (err: any) {
      showToast(err.response?.data?.message || "That bai", "error");
    }
  };

  const formatSize = (b: number) =>
    b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`;

  const isOwner = (doc: any) =>
    isAdmin || (doc.uploadedBy?._id || doc.uploadedBy) === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Share modal */}
      {shareDoc && (
        <div className="fixed inset-0 z-40">
          <ShareModal doc={shareDoc} onClose={() => { setShareDoc(null); fetchDocs(); }} />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tai lieu</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin
                ? `Tat ca ${docs.length} tai lieu`
                : `${myDocs.length} cua ban · ${sharedDocs.length} duoc chia se`
              }
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              {uploading
                ? <><span className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />Dang upload...</>
                : "+ Upload file"
              }
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.txt" multiple hidden
            onChange={e => Array.from(e.target.files || []).forEach(uploadFile)} />
        </div>

        {/* Drop zone — chi admin */}
        {isAdmin && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-colors ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-gray-400 text-sm">
              {uploading ? "Dang upload..." : "Keo tha file PDF / TXT vao day"}
            </p>
          </div>
        )}

        {/* Tabs — chi hien thi voi user thuong */}
        {!isAdmin && (
          <div className="flex gap-1 mb-5 bg-white p-1 rounded-xl border border-gray-100 w-fit shadow-sm">
            <button
              onClick={() => setActiveTab("mine")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "mine" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Cua toi ({myDocs.length})
            </button>
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "shared" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Duoc chia se ({sharedDocs.length})
            </button>
          </div>
        )}

        {/* Noi dung */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : visibleDocs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">{activeTab === "shared" ? "🤝" : "📂"}</p>
            <p className="font-medium">
              {activeTab === "shared"
                ? "Chua co tai lieu nao duoc chia se cho ban"
                : "Chua co tai lieu nao"}
            </p>
            {activeTab === "shared" && (
              <p className="text-sm mt-1">Admin co the cap quyen xem tai lieu cho ban</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleDocs.map((doc: any) => {
              const id    = doc._id || doc.id;
              const owner = isOwner(doc);
              const uploaderName = doc.uploadedBy?.name || doc.uploadedBy?.email || "Admin";

              return (
                <div key={id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {doc.originalName?.endsWith(".pdf") ? "📄" : "📝"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate" title={doc.originalName}>
                        {doc.originalName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">{formatSize(doc.fileSize)}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{doc.totalChunks} chunks</span>
                        {!isAdmin && !owner && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-blue-500">boi {uploaderName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[doc.status] || STATUS_COLOR.pending}`}>
                      {doc.status === "processing" && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1 animate-pulse" />
                      )}
                      {STATUS_LABEL[doc.status] || doc.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    {/* Visibility toggle — chi owner/admin */}
                    {owner && (
                      <button
                        onClick={() => handleToggleVisibility(doc)}
                        className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1 rounded-lg transition-colors"
                      >
                        {doc.visibility === "private" ? "Rieng tu" : "Cong khai"}
                      </button>
                    )}

                    {/* Share — chi owner/admin */}
                    {owner && (
                      <button
                        onClick={() => setShareDoc(doc)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg transition-colors"
                      >
                        Chia se
                      </button>
                    )}

                    {/* Badge doc duoc share */}
                    {!owner && (
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                        Duoc chia se
                      </span>
                    )}

                    {/* Xoa — chi owner/admin */}
                    {owner && (
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1 rounded-lg transition-colors ml-auto"
                      >
                        Xoa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
'@

Write-Host ""
Write-Host "=== Documents UI cap nhat xong! ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Thay doi:" -ForegroundColor Cyan
Write-Host "  - Tab 'Cua toi' / 'Duoc chia se' cho user thuong"
Write-Host "  - Nut 'Chia se' mo modal cap/thu quyen"
Write-Host "  - Doc duoc share hien badge + ten nguoi upload"
Write-Host "  - User thuong khong thay nut Upload / Xoa doc nguoi khac"
Write-Host "  - Admin thay tat ca doc, co nut Upload"
Write-Host ""