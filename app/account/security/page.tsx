"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function AccountSecurityPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Security</h1>
          <p className="mb-6 text-sm text-gray-500">Security settings page is available now and no longer points to a missing route.</p>
          <Link href="/account">
            <Button variant="outline">Back to Account</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
