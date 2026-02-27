/**
 * Customer Messages Page — Chat with the gallery admin.
 *
 * If no thread exists, creating a new message starts one.
 * If a thread exists, shows the real-time chat.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { MessageCircle, Send } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import MessageThread from "@/components/messages/MessageThread";
import { db, auth } from "@/lib/firebase/client";
import { useAuth } from "@/providers/AuthProvider";

export default function CustomerMessagesPage() {
  return (
    <AuthGuard>
      <CustomerMessagesContent />
    </AuthGuard>
  );
}

function CustomerMessagesContent() {
  const { user, isAdmin, profile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const isAdminAsCustomer = profile?.role === "admin" && !isAdmin;
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Redirect admin users to admin messages
  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin/messages");
    }
  }, [isAdmin, router]);

  // Listen for existing thread
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setThreadId(snap.docs[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStartConversation = async () => {
    if (!newMessage.trim() || sending) return;
    if (isAdminAsCustomer) {
      toast.error("You're the artist! You can't message yourself.");
      return;
    }
    setSending(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newMessage.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setThreadId(data.threadId);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <p className="text-muted py-12 text-center">Loading...</p>
      </Container>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <Container>
        <h1 className="text-2xl font-bold text-accent mb-2">Messages</h1>
        <p className="text-sm italic text-primary/70 mb-6">
          &ldquo;Art is a collaboration between God and the artist, and the less the artist does the better.&rdquo; — André Gide
        </p>

        {threadId ? (
          <div className="border border-gray-200 rounded-xl bg-white h-[500px] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-accent">Chat with Art By Leena</h2>
            </div>
            <div className="flex-1 min-h-0">
              <MessageThread threadId={threadId} />
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-accent mb-2">
              Start a Conversation
            </h2>
            <p className="text-muted mb-6">
              Have a question about an artwork, order, or commission? Send us a message!
            </p>
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleStartConversation(); } }}
                placeholder="Type your first message..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-accent placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button onClick={handleStartConversation} loading={sending} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                Send
              </Button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
