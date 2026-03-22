"use client";
import {useState, useRef, useEffect} from "react";
import Navbar from "@/components/Navbar";
import {useChat, Message} from "@/hooks/useChat";
import {chatApi, docApi} from "@/lib/api";
import {
  PlusIcon,
  SendHorizontal,
  FileText,
  History,
  Trash2,
  Layers,
  Menu,
  X,
  MessageSquare,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function ChatPage() {
  const {messages, isLoading, sendMessage, clearChat} = useChat();
  const [input, setInput] = useState("");
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  useEffect(() => {
    docApi
      .list()
      .then((r) =>
        setDocs((r.data.data || []).filter((d: any) => d.status === "ready")),
      );
    chatApi.getSessions().then((r) => setSessions(r.data.data || []));
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), selectedDocs.length ? selectedDocs : undefined);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] font-sans antialiased text-slate-900">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR - Thiết kế tối giản, tiệp màu nền */}
        <aside
          className={`
          ${isSidebarOpen ? "w-72" : "w-0"} 
          fixed inset-y-0 left-0 z-50 bg-[#F9F9F9] border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-in-out md:relative
          overflow-hidden
        `}
        >
          <div className="flex flex-col h-full w-72 p-4 gap-8">
            {/* Nút New Chat bọc trong khối chuyên nghiệp */}
            <button
              onClick={() => {
                clearChat();
              }}
              className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <PlusIcon size={18} className="text-blue-600" />
                <span>Hội thoại mới</span>
              </div>
              <Sparkles
                size={14}
                className="text-slate-300 group-hover:text-blue-400"
              />
            </button>

            {/* Lịch sử hội thoại */}
            <div className="flex flex-col flex-[0.5] min-h-0">
              <h3 className="px-2 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Gần đây
              </h3>
              <div className="overflow-y-auto space-y-0.5 custom-scrollbar pr-2">
                {sessions.map((s: any) => (
                  <div
                    key={s._id}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-200/50 cursor-pointer transition-colors border border-transparent"
                  >
                    <MessageSquare
                      size={15}
                      className="text-slate-400 shrink-0"
                    />
                    <span className="text-sm text-slate-600 truncate">
                      {s.title || "Hội thoại không tên"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tài liệu nguồn */}
            <div className="flex flex-col flex-[0.5] min-h-0 border-t border-slate-200/60 pt-6">
              <h3 className="px-2 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Tài liệu của bạn
              </h3>
              <div className="overflow-y-auto space-y-1 custom-scrollbar pr-2">
                {docs.map((d: any) => {
                  const id = d.id || d._id;
                  const selected = selectedDocs.includes(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border
                      ${selected ? "bg-white border-blue-200 shadow-sm" : "bg-transparent border-transparent hover:bg-slate-200/30"}`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
                      >
                        {selected && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selected}
                          onChange={() =>
                            setSelectedDocs((prev) =>
                              prev.includes(id)
                                ? prev.filter((x) => x !== id)
                                : [...prev, id],
                            )
                          }
                        />
                      </div>
                      <span
                        className={`text-xs truncate ${selected ? "text-blue-700 font-semibold" : "text-slate-500"}`}
                      >
                        {d.originalName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CHAT AREA - Căn giữa nội dung */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          {/* Header Bar - Cố định độ rộng để hài hòa */}
          <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                title={isSidebarOpen ? "Đóng Sidebar" : "Mở Sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose size={20} />
                ) : (
                  <PanelLeftOpen size={20} />
                )}
              </button>
              <div className="h-4 w-[1px] bg-slate-200" />
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                AI IAM Assistant
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider px-3 py-1.5 hover:bg-red-50 rounded-lg"
                >
                  Làm mới chat
                </button>
              )}
            </div>
          </header>

          {/* Vùng Tin Nhắn - Bí quyết căn giữa ở đây */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center w-full">
            <div className="w-full max-w-4xl px-6 md:px-12 py-12">
              {messages.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-200 rotate-3">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Chào mừng bạn!
                  </h1>
                  <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                    Hãy đặt câu hỏi về tài liệu của bạn. Tôi đã sẵn sàng phân
                    tích và hỗ trợ.
                  </p>

                  {/* Gợi ý nhanh */}
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    {[
                      "Tóm tắt tài liệu này",
                      "Tìm các điểm quan trọng",
                      "Phân tích số liệu quý này",
                      "Kiểm tra tính pháp lý",
                    ].map((hint, i) => (
                      <button
                        key={i}
                        className="p-4 bg-white border border-slate-100 rounded-2xl text-sm text-slate-600 font-medium hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm transition-all text-left"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-10`}
                  >
                    <div
                      className={`flex max-w-[85%] gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-bold text-xs transition-transform hover:scale-105
                        ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-blue-600"}`}
                      >
                        {msg.role === "user" ? "U" : "AI"}
                      </div>
                      <div
                        className={`space-y-2 mt-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`px-6 py-4 rounded-[26px] text-[16px] leading-relaxed shadow-sm
                          ${
                            msg.role === "user"
                              ? "bg-slate-900 text-white rounded-tr-none"
                              : "bg-[#F3F4F6]/50 text-slate-800 rounded-tl-none border border-slate-100"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} className="h-20" />
            </div>
          </div>

          {/* Ô Nhập Liệu - Nằm cố định ở giữa dưới cùng */}
          <div className="w-full flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent p-6 pb-10 z-20">
            <div className="w-full max-w-4xl relative group">
              <div className="relative flex items-end bg-white border border-slate-300 rounded-[30px] p-3 pl-5 shadow-lg shadow-slate-200/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 200) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
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
