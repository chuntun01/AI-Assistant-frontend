import { useState, useCallback, useRef } from "react";
import { getToken } from "@/lib/auth";
import { chatApi } from "@/lib/api";

export interface Source {
  docId: string; docName: string; page?: number; score: number;
}
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export function useChat() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingSessionIdRef = useRef<string | null>(null);

  // ── Load lai session cu tu DB ─────────────────────────────────────────
  const loadSession = useCallback(async (id: string) => {
    loadingSessionIdRef.current = id;
    try {
      const res = await chatApi.getSession(id);
      const session = res.data.data;
      if (!session) return;

      // Chuyen messages tu DB sang format cua client
      const loaded: Message[] = session.messages.map((m: any, idx: number) => ({
        id:      `${id}-${idx}`,
        role:    m.role,
        content: m.content,
        sources: m.sources || [],
      }));

      if (loadingSessionIdRef.current !== id) return;

      setMessages(loaded);
      setSessionId(id);
    } catch (err) {
      console.error("Loi load session:", err);
    }
  }, []);

  // ── Gui tin nhan moi ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (
    question: string,
    docIds?: string[],
    onSessionCreated?: (newSessionId: string) => void,
  ) => {
    if (!question.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const asstMsgId = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user",      content: question },
      { id: asstMsgId, role: "assistant", content: "", isStreaming: true },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ question, sessionId, docIds }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "session") {
              const newId = data.sessionId;
              setSessionId(newId);
              // Thong bao cho page.tsx de refresh danh sach sessions
              if (onSessionCreated && !sessionId) {
                onSessionCreated(newId);
              }
            } else if (data.type === "delta") {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId ? { ...m, content: m.content + data.content } : m
              ));
            } else if (data.type === "sources") {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId ? { ...m, sources: data.sources, isStreaming: false } : m
              ));
            } else if (data.type === "error") {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId ? { ...m, content: `Lỗi: ${data.message}`, isStreaming: false } : m
              ));
            }
          } catch { /* ignore parse error */ }
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === asstMsgId ? { ...m, content: `Lỗi kết nối: ${err.message}`, isStreaming: false } : m
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(m =>
        m.id === asstMsgId ? { ...m, isStreaming: false } : m
      ));
    }
  }, [isLoading, sessionId]);

  // ── Xoa chat, bat dau cuoc hoi thoai moi ─────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return { messages, isLoading, sendMessage, loadSession, clearChat, sessionId };
}