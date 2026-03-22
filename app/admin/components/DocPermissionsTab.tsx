"use client";
import { useState, useEffect } from "react";
import { docApi, authApi } from "@/lib/api";

export default function DocPermissionsTab() {
  const [docs, setDocs]       = useState<any[]>([]);
  const [users, setUsers]     = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any|null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [grantForm, setGrantForm] = useState({ userId: "", level: "view" });
  const [toast, setToast]     = useState<{msg:string;type:"success"|"error"}|null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  useEffect(()=>{
    const load = async () => {
      try {
        const [d, u] = await Promise.all([docApi.listAll(), authApi.listUsers()]);
        setDocs((d.data.data||d.data).filter((doc:any)=>doc.status==="ready"));
        setUsers((u.data.data||u.data).filter((user:any)=>user.role!=="admin"));
      } catch { showToast("Khong the tai du lieu","error"); }
      finally { setLoading(false); }
    };
    load();
  },[]);

  const selectDoc = async (doc: any) => {
    setSelectedDoc(doc);
    setLoadingPerms(true);
    try {
      const r = await docApi.getPermissions(doc._id);
      setPermissions(r.data.data || []);
    } catch { setPermissions([]); }
    finally { setLoadingPerms(false); }
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !grantForm.userId) return;
    try {
      await docApi.grantPermission(selectedDoc._id, grantForm.userId, grantForm.level);
      showToast("Da cap quyen thanh cong");
      setGrantForm({userId:"",level:"view"});
      selectDoc(selectedDoc);
    } catch (e: any) {
      showToast(e.response?.data?.message||"That bai","error");
    }
  };

  const handleRevoke = async (targetUserId: string, userName: string) => {
    if (!selectedDoc) return;
    if (!confirm(`Thu hoi quyen cua "${userName}"?`)) return;
    try {
      await docApi.revokePermission(selectedDoc._id, targetUserId);
      showToast("Da thu hoi quyen");
      selectDoc(selectedDoc);
    } catch (e: any) {
      showToast(e.response?.data?.message||"That bai","error");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;

  return (
    <div className="grid grid-cols-5 gap-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type==="success"?"bg-green-500":"bg-red-500"
        }`}>{toast.msg}</div>
      )}

      {/* Danh sach tai lieu */}
      <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm">Chon tai lieu</h3>
          <p className="text-xs text-gray-400 mt-0.5">{docs.length} tai lieu</p>
        </div>
        <div className="overflow-y-auto max-h-[480px]">
          {docs.length === 0
            ? <p className="text-center text-gray-400 text-sm py-8">Chua co tai lieu nao</p>
            : docs.map((doc: any) => (
              <button key={doc._id} onClick={()=>selectDoc(doc)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                  selectedDoc?._id===doc._id
                    ? "bg-blue-50 border-l-2 border-l-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="text-sm font-medium text-gray-700 truncate">{doc.originalName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{doc.totalChunks} chunks</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    doc.visibility==="public"
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {doc.visibility}
                  </span>
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* Panel quyen */}
      <div className="col-span-3 space-y-4">
        {!selectedDoc
          ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
              <div className="text-center text-gray-400">
                <p className="text-3xl mb-2">ðŸ‘ˆ</p>
                <p className="text-sm">Chon tai lieu de quan ly quyen</p>
              </div>
            </div>
          )
          : (
            <>
              {/* Cap quyen */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">
                  Cap quyen â€” <span className="text-blue-600 font-normal truncate">{selectedDoc.originalName}</span>
                </h3>
                <form onSubmit={handleGrant} className="flex gap-2">
                  <select value={grantForm.userId} onChange={e=>setGrantForm({...grantForm,userId:e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                    <option value="">-- Chon nguoi dung --</option>
                    {users
                      .filter(u => !permissions.some((p:any)=>
                        (p.userId?._id||p.userId)===u._id
                      ))
                      .map((u:any)=>(
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))
                    }
                  </select>
                  <select value={grantForm.level} onChange={e=>setGrantForm({...grantForm,level:e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                    <option value="view">Xem</option>
                    <option value="edit">Sua</option>
                  </select>
                  <button type="submit" disabled={!grantForm.userId}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                    Cap quyen
                  </button>
                </form>
              </div>

              {/* Danh sach quyen hien tai */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Nguoi duoc cap quyen ({permissions.length})
                  </h3>
                </div>
                {loadingPerms
                  ? <div className="flex justify-center py-8"><div className="spinner"/></div>
                  : permissions.length === 0
                    ? <p className="text-center text-gray-400 text-sm py-8">Chua cap quyen cho ai</p>
                    : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <th className="text-left px-4 py-2.5 font-medium">Nguoi dung</th>
                            <th className="text-left px-4 py-2.5 font-medium">Quyen</th>
                            <th className="text-left px-4 py-2.5 font-medium">Cap boi</th>
                            <th className="px-4 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {permissions.map((perm: any) => {
                            const user = perm.userId;
                            const grantor = perm.grantedBy;
                            return (
                              <tr key={perm._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-gray-700">{user?.name||"?"}</p>
                                  <p className="text-xs text-gray-400">{user?.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    perm.level==="edit"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-blue-50 text-blue-700"
                                  }`}>
                                    {perm.level==="edit"?"Sua":"Xem"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                  {grantor?.name||"Admin"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={()=>handleRevoke(user?._id||user, user?.name||"?")}
                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2.5 py-1 rounded-lg transition-colors">
                                    Thu hoi
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )
                }
              </div>
            </>
          )
        }
      </div>
    </div>
  );
}