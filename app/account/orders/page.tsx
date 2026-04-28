"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const orders = [
  { id: "ORD-001", item: "Betta Fish - Halfmoon", date: "Dec 1, 2024", total: "₹1,499", status: "Delivered" },
  { id: "ORD-002", item: "Aquarium Tank 50L", date: "Nov 28, 2024", total: "₹4,999", status: "Shipped" },
  { id: "ORD-003", item: "Goldfish - Oranda", date: "Nov 25, 2024", total: "₹899", status: "Processing" },
];

const statusMeta = {
  Delivered: { icon: CheckCircle, className: "bg-green-100 text-green-700" },
  Shipped: { icon: Truck, className: "bg-blue-100 text-blue-700" },
  Processing: { icon: Clock, className: "bg-yellow-100 text-yellow-700" },
} as const;

export default function AccountOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-500">Track your recent purchases and delivery status.</p>
            </div>
            <Link href="/account">
              <Button variant="outline">Back to Account</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {orders.map((order, index) => {
              const meta = statusMeta[order.status as keyof typeof statusMeta];
              const StatusIcon = meta.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-gray-900">{order.item}</p>
                      </div>
                      <p className="text-sm text-gray-500">{order.id} • {order.date}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="mb-2 font-semibold text-gray-900">{order.total}</p>
                      <Badge className={meta.className}>
                        <StatusIcon className="mr-1 h-3.5 w-3.5" />
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
