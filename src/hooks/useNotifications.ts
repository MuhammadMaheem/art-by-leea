/**
 * useNotifications — Real-time hook for user notifications.
 *
 * Subscribes to the current user's notifications from Firestore.
 * Provides unread count and ability to mark notifications as read.
 */
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { AppNotification } from "@/types";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as AppNotification)
      );
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  return { notifications, unreadCount, markAllRead };
}
