import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import styles from "./styles/MessageRenderer.module.css";

function parseText(raw) {
  if (typeof raw === "string") return raw;
  if (!raw) return "";
  if (Array.isArray(raw)) {
    return raw.map((item) => parseText(item)).filter(Boolean).join("\n\n");
  }
  if (typeof raw === "object") {
    if (raw.text) return parseText(raw.text);
    if (raw.answer) return parseText(raw.answer);
    if (raw.message) return parseText(raw.message);
    if (raw.content) return parseText(raw.content);
    return JSON.stringify(raw);
  }
  return String(raw);
}

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const codeContent = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInline = !className && !codeContent.includes("\n");
  if (isInline) {
    return <code className={styles.inlineCode}>{children}</code>;
  }

  const langMatch = /language-(\w+)/.exec(className || "");
  const langName = langMatch ? langMatch[1] : "code";

  return (
    <div className={styles.codeContainer}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{langName}</span>
        <button
          type="button"
          className={styles.copyCodeBtn}
          onClick={handleCopy}
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} className={styles.checkIcon} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className={styles.codeBlock}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function MessageRenderer({ text }) {
  const content = parseText(text);
  if (!content) return null;

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className={styles.tableWrap}>
              <table>{children}</table>
            </div>
          ),
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
