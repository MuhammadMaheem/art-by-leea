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
    <section className="py-14 md:py-20">
      <Container>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Messages</h1>
        <p className="text-sm italic text-primary/70 mb-8">
          &ldquo;Art is a collaboration between God and the artist, and the less the artist does the better.&rdquo; — André Gide
        </p>

        {threadId ? (
          <div className="gallery-card h-[500px] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-secondary-warm">
              <h2 className="font-heading font-semibold text-foreground">Chat with Art By Leena</h2>
            </div>
            <div className="flex-1 min-h-0">
              <MessageThread threadId={threadId} />
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted/40 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
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
                className="flex-1 px-4 py-3 rounded-full border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white dark:focus:bg-secondary-deep transition-colors"
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
