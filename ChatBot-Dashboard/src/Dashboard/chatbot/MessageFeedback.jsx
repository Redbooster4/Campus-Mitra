import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

function MessageFeedback({ messageId, chatId, onFeedback }) {
  const [feedback, setFeedback] = useState(null); // null | "up" | "down"

  function handleClick(type) {
    if (feedback === type) return; // already selected, no-op
    setFeedback(type);
    onFeedback?.(chatId, messageId, type);
  }

  return (
    <div className="flex items-center gap-1 mt-1.5 ml-1">
      <button
        onClick={() => handleClick("up")}
        title="Good response"
        className={`p-1 rounded-md transition-colors ${
          feedback === "up"
            ? "text-green-400 bg-green-400/10"
            : "text-indigo-400/50 hover:text-green-400 hover:bg-green-400/10"
        }`}
      >
        <ThumbsUp size={13} fill={feedback === "up" ? "currentColor" : "none"} />
      </button>
      <button
        onClick={() => handleClick("down")}
        title="Bad response"
        className={`p-1 rounded-md transition-colors ${
          feedback === "down"
            ? "text-red-400 bg-red-400/10"
            : "text-indigo-400/50 hover:text-red-400 hover:bg-red-400/10"
        }`}
      >
        <ThumbsDown size={13} fill={feedback === "down" ? "currentColor" : "none"} />
      </button>
      {feedback && (
        <span className="text-[11px] text-indigo-400/50 ml-1">Thanks for the feedback</span>
      )}
    </div>
  );
}

export default MessageFeedback;