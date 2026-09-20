"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
  isUser?: boolean;
}

export default function MarkdownRenderer({ content, isUser = false }: Props) {
  if (isUser) {
    // Tin nhan user: render plaintext, giu xuong dong
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Tieu de
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold text-slate-800 mt-4 mb-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-slate-800 mt-3 mb-1 first:mt-0">{children}</h3>
        ),

        // Doan van
        p: ({ children }) => (
          <p className="text-[15px] leading-relaxed text-slate-800 mb-3 last:mb-0">{children}</p>
        ),

        // Danh sach
        ul: ({ children }) => (
          <ul className="list-disc list-outside pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside pl-5 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-[15px] leading-relaxed text-slate-800">{children}</li>
        ),

        // Code inline
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block bg-slate-900 text-emerald-300 text-[13px] font-mono px-4 py-3 rounded-xl my-3 overflow-x-auto whitespace-pre">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-slate-100 text-blue-700 text-[13px] font-mono px-1.5 py-0.5 rounded-md">
              {children}
            </code>
          );
        },

        // Block code (pre boc ngoai code)
        pre: ({ children }) => (
          <pre className="bg-slate-900 rounded-xl my-3 overflow-x-auto">
            {children}
          </pre>
        ),

        // Blockquote (trich dan)
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-400 pl-4 my-3 text-slate-600 italic bg-blue-50/50 py-2 rounded-r-lg">
            {children}
          </blockquote>
        ),

        // Duong ke ngang
        hr: () => <hr className="border-slate-200 my-4" />,

        // In dam / in nghieng
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-700">{children}</em>
        ),

        // Lien ket
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 transition-colors"
          >
            {children}
          </a>
        ),

        // Bang (table - tu remark-gfm)
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse border border-slate-200 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-100 text-slate-700 font-semibold">{children}</thead>
        ),
        tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
        tr: ({ children }) => <tr className="hover:bg-slate-50 transition-colors">{children}</tr>,
        th: ({ children }) => (
          <th className="px-4 py-2 text-left border border-slate-200">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border border-slate-200 text-slate-700">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
