/**
 * InboxList — Real-time list of message threads.
 *
 * Shows thread preview with customer name, last message, and unread count.
 */
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/utils/cn";
import type { MessageThread } from "@/types";

interface InboxListProps {
  selectedThreadId: string | null;
  onSelectThread: (thread: MessageThread) => void;
  autoSelectThreadId?: string | null;
}

export default function InboxList({ selectedThreadId, onSelectThread, autoSelectThreadId }: InboxListProps) {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageThread));
      setThreads(data);
    });

    return () => unsubscribe();
  }, []);

  // Auto-select thread from prop (e.g. deep-link from commissions page)
  useEffect(() => {
    if (autoSelectThreadId && !autoSelected && threads.length > 0) {
      const match = threads.find((t) => t.id === autoSelectThreadId);
      if (match) {
        onSelectThread(match);
        setAutoSelected(true);
      }
    }
  }, [autoSelectThreadId, threads, autoSelected, onSelectThread]);

  const getUnread = (thread: MessageThread) =>
    profile?.role === "admin" ? thread.unreadByAdmin : thread.unreadByCustomer;

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <MessageCircle className="w-10 h-10 mb-3" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-secondary-warm">
      {threads.map((thread) => {
        const unread = getUnread(thread);
        const isSelected = selectedThreadId === thread.id;
        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={cn(
              "w-full text-left px-4 py-3.5 hover:bg-secondary/50 transition-all cursor-pointer",
              isSelected && "bg-primary-light/30 border-r-2 border-primary"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-foreground text-sm truncate">
                {thread.customerName}
              </span>
              {unread > 0 && (
                <span className="bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {unread}
                </span>
              )}
            </div>
            <p className="text-xs text-muted truncate">{thread.lastMessage}</p>
          </button>
        );
      })}
    </div>
  );
}
