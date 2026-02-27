/**
 * Admin Messages Page — View and respond to customer message threads.
 */
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import InboxList from "@/components/messages/InboxList";
import MessageThread from "@/components/messages/MessageThread";
import type { MessageThread as MessageThreadType } from "@/types";

export default function AdminMessagesPage() {
  return (
    <AuthGuard requireAdmin>
      <MessagesContent />
    </AuthGuard>
  );
}

function MessagesContent() {
  const [selectedThread, setSelectedThread] = useState<MessageThreadType | null>(null);

  return (
    <Container>
      <h1 className="text-2xl font-bold text-accent mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Thread list */}
        <div className="lg:col-span-1 border border-gray-200 rounded-xl overflow-y-auto bg-white">
          <InboxList
            selectedThreadId={selectedThread?.id || null}
            onSelectThread={setSelectedThread}
          />
        </div>

        {/* Chat view */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white flex flex-col">
          {selectedThread ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-accent">{selectedThread.customerName}</h2>
                <p className="text-xs text-muted">{selectedThread.customerEmail}</p>
              </div>
              <div className="flex-1 min-h-0">
                <MessageThread threadId={selectedThread.id} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageCircle className="w-12 h-12 mb-3" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
