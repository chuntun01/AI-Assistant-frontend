"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useChat } from "@/hooks/useChat";
import { chatApi, docApi } from "@/lib/api";
import {
  PlusIcon, SendHorizontal, MessageSquare, Sparkles,
  PanelLeftClose, PanelLeftOpen, Trash2, FileText, BookOpen,
} from "lucide-react";

// ── Tiện ích phân nhóm session theo ngày ────────────────────────────────
function groupSessionsByDate(sessions: any[]) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups: Record<string, any[]> = {
    "Hôm nay": [], "Hôm qua": [], "7 ngày trước": [], "Cũ hơn": [],
  };
  sessions.forEach(s => {
    const d = new Date(s.updatedAt || s.createdAt).getTime();
    const diff = today - new Date(new Date(d).getFullYear(), new Date(d).getMonth(), new Date(d).getDate()).getTime();
    if (diff === 0)             groups["Hôm nay"].push(s);
    else if (diff === 86400000) groups["Hôm qua"].push(s);
    else if (diff <= 604800000) groups["7 ngày trước"].push(s);
    else                        groups["Cũ hơn"].push(s);
  });
  return groups;
}

export default function ChatPage() {
  const { messages, isLoading, sendMessage, loadSession, clearChat, sessionId } = useChat();
  const [input, setInput]               = useState("");
  const [docs, setDocs]                 = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [sessions, setSessions]         = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen]     = useState(true);
  const [deletingId, setDeletingId]           = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Scroll xuong cuoi moi khi co tin nhan moi
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load danh sach sessions & tai lieu khi mount
  const refreshSessions = useCallback(async () => {
    const r = await chatApi.getSessions().catch(() => null);
    if (r) setSessions(r.data.data || []);
  }, []);

  useEffect(() => {
    docApi.list().then(r =>
      setDocs((r.data.data || []).filter((d: any) => d.status === "ready"))
    ).catch(() => {});
    refreshSessions();
  }, []);

  // ── Click vao session cu ──────────────────────────────────────────────
  const handleSelectSession = useCallback(async (id: string) => {
    if (id === activeSessionId) return;
    setActiveSessionId(id);
    await loadSession(id);
  }, [activeSessionId, loadSession]);

  // ── Xoa session ───────────────────────────────────────────────────────
  const handleDeleteSession = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Khong trigger click session
    setDeletingId(id);
    try {
      await chatApi.deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      // Neu dang xem session bi xoa, tao chat moi
      if (activeSessionId === id) {
        clearChat();
        setActiveSessionId(null);
      }
    } catch {}
    setDeletingId(null);
  }, [activeSessionId, clearChat]);

  // ── New chat ──────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    clearChat();
    setActiveSessionId(null);
  }, [clearChat]);

  // ── Gui tin nhan ──────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    sendMessage(question, selectedDocs.length ? selectedDocs : undefined, (newId) => {
      // Session moi vua duoc tao: refresh list va highlight
      refreshSessions().then(() => setActiveSessionId(newId));
    });
  }, [input, isLoading, selectedDocs, sendMessage, refreshSessions]);

  // Phân nhóm sessions
  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] font-sans antialiased text-slate-900">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── SIDEBAR ────────────────────────────────────────────── */}
        <aside className={`
          ${isSidebarOpen ? "w-72" : "w-0"}
          fixed inset-y-0 left-0 z-50 bg-[#F9F9F9] border-r border-slate-200/60 flex flex-col
          transition-all duration-300 ease-in-out md:relative overflow-hidden
        `}>
          <div className="flex flex-col h-full w-72 p-4 gap-6 overflow-hidden">

            {/* Nút New Chat */}
            <button
              onClick={handleNewChat}
              className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm group shrink-0"
            >
              <div className="flex items-center gap-2">
                <PlusIcon size={18} className="text-blue-600" />
                <span>Hội thoại mới</span>
              </div>
              <Sparkles size={14} className="text-slate-300 group-hover:text-blue-400" />
            </button>

            {/* ── Lịch sử hội thoại (phân nhóm) ─────────────────── */}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <h3 className="px-2 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                Lịch sử
              </h3>
              <div className="overflow-y-auto space-y-4 custom-scrollbar pr-1 flex-1">
                {Object.entries(groupedSessions).map(([label, group]) => {
                  if (!group.length) return null;
                  return (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                        {label}
                      </p>
                      <div className="space-y-0.5">
                        {group.map((s: any) => {
                          const isActive = s._id === activeSessionId;
                          return (
                            <div
                              key={s._id}
                              onClick={() => handleSelectSession(s._id)}
                              className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all border
                                ${isActive
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "border-transparent hover:bg-slate-200/50 text-slate-600"
                                }`}
                            >
                              <MessageSquare size={14} className={`shrink-0 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                              <span className="text-sm truncate flex-1 leading-snug">
                                {s.title || "Hội thoại không tên"}
                              </span>
                              {/* Nút xoá - chỉ hiện khi hover */}
                              <button
                                onClick={(e) => handleDeleteSession(e, s._id)}
                                disabled={deletingId === s._id}
                                className={`shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all
                                  hover:bg-red-100 hover:text-red-500 text-slate-400
                                  ${deletingId === s._id ? "animate-spin" : ""}`}
                                title="Xóa hội thoại"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {sessions.length === 0 && (
                  <p className="text-xs text-slate-400 px-2 italic">Chưa có hội thoại nào</p>
                )}
              </div>
            </div>

            {/* ── Tài liệu nguồn ─────────────────────────────────── */}
            <div className="flex flex-col shrink-0 max-h-52 border-t border-slate-200/60 pt-4">
              <h3 className="px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Tài liệu ({docs.length})
              </h3>
              <div className="overflow-y-auto space-y-1 custom-scrollbar pr-1">
                {docs.length === 0 && (
                  <p className="text-xs text-slate-400 px-2 italic">Chưa có tài liệu</p>
                )}
                {docs.map((d: any) => {
                  const id = d.id || d._id;
                  const selected = selectedDocs.includes(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border
                        ${selected ? "bg-white border-blue-200 shadow-sm" : "bg-transparent border-transparent hover:bg-slate-200/30"}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                        ${selected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}>
                        {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        <input type="checkbox" className="hidden" checked={selected}
                          onChange={() => setSelectedDocs(prev =>
                            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                          )}
                        />
                      </div>
                      <FileText size={12} className={selected ? "text-blue-500 shrink-0" : "text-slate-400 shrink-0"} />
                      <span className={`text-xs truncate ${selected ? "text-blue-700 font-semibold" : "text-slate-500"}`}>
                        {d.originalName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CHAT AREA ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">

          {/* Header */}
          <header className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-20 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              <div className="h-4 w-[1px] bg-slate-200" />
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                AI IAM Assistant
              </h2>
              {activeSessionId && (
                <span className="text-xs text-slate-400 font-medium">
                  — {sessions.find(s => s._id === activeSessionId)?.title || "Hội thoại"}
                </span>
              )}
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider px-3 py-1.5 hover:bg-red-50 rounded-lg"
              >
                Làm mới
              </button>
            )}
          </header>

          {/* Vùng tin nhắn */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center w-full">
            <div className="w-full max-w-4xl px-6 md:px-12 py-12">
              {messages.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-200 rotate-3">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Chào mừng bạn!</h1>
                  <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                    Hãy đặt câu hỏi về tài liệu của bạn. Tôi đã sẵn sàng phân tích và hỗ trợ.
                  </p>
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    {["Tóm tắt tài liệu này", "Tìm các điểm quan trọng", "Phân tích số liệu", "Kiểm tra tính pháp lý"].map((hint, i) => (
                      <button key={i} onClick={() => { setInput(hint); inputRef.current?.focus(); }}
                        className="p-4 bg-white border border-slate-100 rounded-2xl text-sm text-slate-600 font-medium hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm transition-all text-left">
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-8`}>
                    <div className={`flex max-w-[85%] gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-bold text-xs
                        ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-blue-600"}`}>
                        {msg.role === "user" ? "U" : "AI"}
                      </div>

                      <div className={`space-y-2 mt-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                        {/* Bubble tin nhắn */}
                        <div className={`px-6 py-4 rounded-[24px] shadow-sm
                          ${msg.role === "user"
                            ? "bg-slate-900 text-white rounded-tr-none text-[15px] leading-relaxed"
                            : "bg-[#F3F4F6]/60 text-slate-800 rounded-tl-none border border-slate-100"
                          }`}>
                          <MarkdownRenderer content={msg.content} isUser={msg.role === "user"} />
                          {/* Cursor nhap nháy khi stream */}
                          {msg.isStreaming && msg.role === "assistant" && (
                            <span className="inline-block w-2 h-4 bg-blue-500 rounded-sm animate-pulse ml-1 align-middle" />
                          )}
                        </div>

                        {/* ── Giai đoạn 3: Nguồn tham khảo ─────────── */}
                        {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                          <div className="flex flex-wrap gap-2 px-1">
                            {msg.sources.map((src, i) => (
                              <div key={i}
                                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
                                title={`Điểm tương đồng: ${Math.round(src.score * 100)}%`}
                              >
                                <BookOpen size={11} className="text-blue-400" />
                                <span className="font-medium truncate max-w-[160px]">{src.docName}</span>
                                {src.page && <span className="text-slate-400">trang {src.page}</span>}
                                <span className="text-slate-300">•</span>
                                <span className="text-blue-500 font-semibold">{Math.round(src.score * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} className="h-20" />
            </div>
          </div>

          {/* Ô nhập liệu */}
          <div className="w-full flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent p-6 pb-10 z-20 shrink-0">
            <div className="w-full max-w-4xl">
              <div className="relative flex items-end bg-white border border-slate-300 rounded-[30px] p-3 pl-5 shadow-lg shadow-slate-200/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Hỏi AI Assistant..."
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none py-3 text-[16px] focus:ring-0 resize-none max-h-52 custom-scrollbar"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="mb-1 p-3.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-90 shadow-md shadow-blue-200 shrink-0"
                >
                  <SendHorizontal size={20} strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-[11px] text-center mt-4 text-slate-400 font-medium tracking-wide">
                Hệ thống AI đang sử dụng dữ liệu nội bộ được bảo mật • 2026
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
