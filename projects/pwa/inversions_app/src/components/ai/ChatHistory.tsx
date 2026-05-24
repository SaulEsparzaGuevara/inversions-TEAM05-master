import React from "react";
import { useChatStore, type ChatMessage } from "../../store/chat";

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div style={{
        textAlign: "center",
        padding: "0.5rem",
        fontSize: "0.8rem",
        color: "var(--color-text-muted)"
      }}>
        {msg.content}
      </div>
    );
  }

  const bubbleColor = isUser ? "var(--color-accent)" : "var(--color-surface-raised)";
  const textColor = isUser ? "#fff" : "var(--color-text)";
  const align = isUser ? "flex-end" : "flex-start";

  let statusIndicator: React.ReactNode = null;
  if (msg.status === "pending" || msg.status === "processing") {
    statusIndicator = (
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>
        {msg.pollingAttempts ? `(${msg.pollingAttempts}/15)` : "..."}
      </span>
    );
  } else if (msg.status === "error") {
    statusIndicator = (
      <span style={{ fontSize: "0.7rem", color: "var(--color-sell)", marginLeft: "0.5rem" }}>
        Error
      </span>
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: align,
      marginBottom: "0.75rem"
    }}>
      <div style={{
        maxWidth: "80%",
        background: bubbleColor,
        borderRadius: isUser ? "var(--radius-md) var(--radius-md) 0 var(--radius-md)" : "var(--radius-md) var(--radius-md) var(--radius-md) 0",
        padding: "0.65rem 0.85rem",
        color: textColor,
        fontSize: "0.85rem",
        lineHeight: 1.5,
        whiteSpace: "pre-wrap"
      }}>
        {msg.content}
        {statusIndicator}
      </div>
    </div>
  );
}

export const ChatHistory: React.FC = () => {
  const { history } = useChatStore();

  if (history.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "200px",
        color: "var(--color-text-muted)",
        fontSize: "0.85rem"
      }}>
        Envía un mensaje para comenzar el análisis
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: "0.5rem"
    }}>
      {history.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
    </div>
  );
};
