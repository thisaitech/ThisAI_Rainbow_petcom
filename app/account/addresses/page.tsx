"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, MapPin, Plus } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const addresses = [
  {
    id: "addr-1",
    label: "Home",
    name: "Priya",
    phone: "+91 98765 43210",
    lines: ["12 Lake View Road", "Anna Nagar", "Chennai, Tamil Nadu - 600040"],
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    name: "Priya",
    phone: "+91 98765 43210",
    lines: ["4th Floor, Pet Care Tower", "OMR", "Chennai, Tamil Nadu - 600096"],
    isDefault: false,
  },
];

export default function AccountAddressesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-sm text-gray-500">Manage delivery locations for your orders.</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
              <Link href="/account">
                <Button variant="outline">Back to Account</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{address.label}</p>
                      <p className="text-sm text-gray-500">{address.name} • {address.phone}</p>
                    </div>
                  </div>
                  {address.isDefault && <Badge className="bg-green-100 text-green-700">Default</Badge>}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {address.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                    Remove
                  </Button>
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Deliverable
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
