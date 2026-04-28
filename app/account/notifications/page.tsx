"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function AccountNotificationsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <Bell className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mb-6 text-sm text-gray-500">Notification preferences page is now available instead of a 404.</p>
          <Link href="/account">
            <Button variant="outline">Back to Account</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
