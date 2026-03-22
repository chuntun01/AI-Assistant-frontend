"use client";
import {docApi} from "@/lib/api";
import {
  FileText,
  Trash2,
  Globe,
  Lock,
  Database,
  User,
  HardDrive,
  Loader2,
  FileCode,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";

interface Doc {
  id: string;
  _id?: string;
  originalName: string;
  fileSize: number;
  totalChunks: number;
  status: string;
  visibility: string;
  uploadedBy?: {email: string; name: string};
}

interface Props {
  doc: Doc;
  currentUserId: string;
  onDelete: (id: string) => void;
  onEmbed: (id: string) => void;
  onRefresh: () => void;
}

// Map màu sắc trạng thái chuyên nghiệp hơn
const statusStyles: Record<
  string,
  {bg: string; text: string; label: string; dot: string}
> = {
  pending: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "Chờ xử lý",
    dot: "bg-slate-400",
  },
  processing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Đang xử lý",
    dot: "bg-blue-500 animate-pulse",
  },
  ready: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Sẵn sàng",
    dot: "bg-emerald-500",
  },
  failed: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Lỗi xử lý",
    dot: "bg-red-500",
  },
};

export default function DocumentCard({
  doc,
  onDelete,
  onEmbed,
  onRefresh,
}: Props) {
  const id = doc.id || doc._id || "";

  const formatSize = (b: number) =>
    b < 1024
      ? `${b} B`
      : b < 1048576
        ? `${(b / 1024).toFixed(1)} KB`
        : `${(b / 1048576).toFixed(1)} MB`;

  const toggleVisibility = async () => {
    try {
      const next = doc.visibility === "private" ? "public" : "private";
      await docApi.setVisibility(id, next);
      onRefresh();
    } catch (error) {
      console.error("Lỗi thay đổi quyền riêng tư:", error);
    }
  };

  const currentStatus = statusStyles[doc.status] || statusStyles.pending;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
      {/* Trang trí góc thẻ */}
      <div
        className={`absolute top-0 right-0 w-1 h-full ${doc.status === "ready" ? "bg-emerald-500/10" : "bg-transparent"}`}
      />

      <div className="flex flex-col h-full gap-4">
        {/* Header: Icon + Status */}
        <div className="flex items-start justify-between">
          <div
            className={`p-2.5 rounded-xl ${doc.originalName.endsWith(".pdf") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
          >
            {doc.originalName.endsWith(".pdf") ? (
              <FileText size={24} />
            ) : (
              <FileCode size={24} />
            )}
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${currentStatus.bg} ${currentStatus.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.label}
          </div>
        </div>

        {/* Content: Name + Metadata */}
        <div className="space-y-1 mt-1">
          <h3
            className="font-bold text-slate-800 text-[15px] truncate leading-tight group-hover:text-blue-600 transition-colors"
            title={doc.originalName}
          >
            {doc.originalName}
          </h3>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[12px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <HardDrive size={12} />
              {formatSize(doc.fileSize)}
            </span>
            <span className="flex items-center gap-1">
              <Database size={12} />
              {doc.totalChunks} chunks
            </span>
          </div>
        </div>

        {/* Footer: User + Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          {doc.uploadedBy ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <User size={12} />
              </div>
              <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">
                {doc.uploadedBy.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-slate-300" />
              <span className="text-xs text-slate-300 font-medium">
                Hệ thống
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {doc.status === "ready" && (
              <button
                onClick={() => onEmbed(id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors title='Tạo Vector Embeddings'"
              >
                <Database size={16} />
              </button>
            )}

            <button
              onClick={toggleVisibility}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all
                ${
                  doc.visibility === "private"
                    ? "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
            >
              {doc.visibility === "private" ? (
                <Lock size={13} />
              ) : (
                <Globe size={13} />
              )}
              <span className="uppercase tracking-tighter">
                {doc.visibility === "private" ? "Riêng tư" : "Công khai"}
              </span>
            </button>

            <button
              onClick={() => onDelete(id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Xóa tài liệu"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
