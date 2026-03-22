import { useState, useCallback } from "react";
import { getToken } from "@/lib/auth";

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
  const [messages, setMessages]     = useState<Message[]>([]);
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);

  const sendMessage = useCallback(async (question: string, docIds?: string[]) => {
    if (!question.trim() || isLoading) return;

    const userMsgId  = Date.now().toString();
    const asstMsgId  = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", content: question },
      { id: asstMsgId, role: "assistant", content: "", isStreaming: true },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
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
            if (data.type === "session") setSessionId(data.sessionId);
            else if (data.type === "delta") {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId ? { ...m, content: m.content + data.content } : m
              ));
            } else if (data.type === "sources") {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId ? { ...m, sources: data.sources, isStreaming: false } : m
              ));
            } else if (data.type === "error") {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId ? { ...m, content: `Lá»—i: ${data.message}`, isStreaming: false } : m
              ));
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === asstMsgId ? { ...m, content: `Lá»—i káº¿t ná»‘i: ${err.message}`, isStreaming: false } : m
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, isStreaming: false } : m));
    }
  }, [isLoading, sessionId]);

  const clearChat = useCallback(() => { setMessages([]); setSessionId(null); }, []);

  return { messages, isLoading, sendMessage, clearChat, sessionId };
}