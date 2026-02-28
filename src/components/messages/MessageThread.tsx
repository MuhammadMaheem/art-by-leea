/**
 * MessageThread — Real-time chat view for a single message thread.
 *
 * Uses Firestore onSnapshot for live message updates.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { Send } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/utils/cn";
import type { ChatMessage } from "@/types";

interface MessageThreadProps {
  threadId: string;
}

export default function MessageThread({ threadId }: MessageThreadProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!threadId) return;

    const q = query(
      collection(db, "messages", threadId, "chats"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
    });

    // Mark messages as read
    const unreadField = profile?.role === "admin" ? "unreadByAdmin" : "unreadByCustomer";
    updateDoc(doc(db, "messages", threadId), { [unreadField]: 0 }).catch(() => {});

    return () => unsubscribe();
  }, [threadId, profile?.role]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threadId, text: text.trim() }),
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-xl px-4 py-2.5 text-sm",
                  isOwn
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    isOwn ? "text-white/60" : "text-muted"
                  )}
                >
                  {msg.createdAt &&
                    (typeof msg.createdAt === "string"
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : msg.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-secondary-warm p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white dark:focus:bg-secondary-deep transition-colors text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-full bg-primary hover:bg-primary-dark text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
