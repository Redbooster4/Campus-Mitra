import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./styles/MessageRenderer.module.css";

export default function MessageRenderer({ text }) {
  if (typeof text !== "string") return text;

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a:({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table:({ children }) => (
            <div className={styles.tableWrap}>
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

