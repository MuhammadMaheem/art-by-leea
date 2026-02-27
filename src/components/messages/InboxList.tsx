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
}

export default function InboxList({ selectedThreadId, onSelectThread }: InboxListProps) {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);

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
    <div className="divide-y divide-gray-100">
      {threads.map((thread) => {
        const unread = getUnread(thread);
        const isSelected = selectedThreadId === thread.id;
        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={cn(
              "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
              isSelected && "bg-primary-light/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-accent text-sm truncate">
                {thread.customerName}
              </span>
              {unread > 0 && (
                <span className="bg-primary text-accent text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
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
