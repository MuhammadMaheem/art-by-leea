import type { Metadata } from "next";
import ProfilePageContent from "@/components/profile/ProfilePageContent";

export const metadata: Metadata = {
  title: "Profile | Art By Aleeha",
  description: "Manage your account, track orders, and review commission requests.",
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
