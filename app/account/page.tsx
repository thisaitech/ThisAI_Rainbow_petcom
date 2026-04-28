"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Bell,
  Shield,
  Edit,
  Camera
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";

const menuItems = [
  { icon: Package, label: "My Orders", href: "/account/orders", badge: "3" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist", badge: "5" },
  { icon: MapPin, label: "Addresses", href: "/account/addresses" },
  { icon: CreditCard, label: "Payment Methods", href: "/account/payments" },
  { icon: Bell, label: "Notifications", href: "/account/notifications" },
  { icon: Shield, label: "Security", href: "/account/security" },
  { icon: Settings, label: "Settings", href: "/account/settings" },
];

const recentOrders = [
  { id: "ORD-001", product: "Betta Fish - Halfmoon", status: "Delivered", date: "Dec 1, 2024", amount: "₹1,499" },
  { id: "ORD-002", product: "Aquarium Tank 50L", status: "Shipped", date: "Nov 28, 2024", amount: "₹4,999" },
  { id: "ORD-003", product: "Goldfish - Oranda", status: "Processing", date: "Nov 25, 2024", amount: "₹899" },
];

const statusColors: Record<string, string> = {
  "Delivered": "bg-green-100 text-green-700",
  "Shipped": "bg-blue-100 text-blue-700",
  "Processing": "bg-yellow-100 text-yellow-700",
};

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && (currentUser?.role === "admin" || currentUser?.role === "owner")) {
      router.push("/admin/dashboard");
    }
  }, [currentUser, isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Welcome to Rainbow Aqua</h1>
            <p className="text-gray-500 mb-8">
              Sign in to access your account, track orders, and manage your wishlist.
            </p>

            <div className="space-y-3">
              <Link href="/auth/signin" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-sm text-orange-700">
                🎁 <strong>New members</strong> get 10% off their first order!
              </p>
            </div>
          </motion.div>
        </div>

        <Footer />
      </main>
    );
  }

  if (currentUser.role !== "user") {
    return null;
  }

  const memberSince = new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const user = {
    name: currentUser.name,
    email: currentUser.email || "No email added",
    phone: currentUser.mobile ? `+91 ${currentUser.mobile}` : "+91 98765 43210",
    district: currentUser.address?.district || "Chennai",
    memberSince,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border p-6"
              >
                {/* Profile */}
                <div className="text-center mb-6">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border">
                      <Camera className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                  <h2 className="font-semibold text-gray-800">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Member since {user.memberSince}
                  </Badge>
                </div>

                {/* Menu */}
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-gray-400" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <Badge className="bg-primary text-white text-xs">{item.badge}</Badge>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    router.push("/auth/signin");
                  }}
                  className="w-full mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Welcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white"
              >
                <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name.split(" ")[0]}! 👋</h1>
                <p className="text-white/80">
                  Track your orders, manage wishlist, and explore our premium collection.
                </p>
              </motion.div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Orders", value: "12", icon: Package },
                  { label: "Wishlist", value: "5", icon: Heart },
                  { label: "Reviews", value: "3", icon: Edit },
                  { label: "Points", value: "250", icon: ShoppingBag },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm border"
                  >
                    <stat.icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border"
              >
                <div className="p-5 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                  <Link href="/account/orders" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
                <div className="divide-y">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-800">{order.product}</p>
                        <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{order.amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Profile Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border p-6"
              >
                <h2 className="font-semibold text-gray-800 mb-4">Profile Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input id="name" defaultValue={user.name} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input id="phone" defaultValue={user.phone} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-sm">District</Label>
                    <Input id="district" defaultValue={user.district} className="mt-1" />
                  </div>
                </div>
                <Button className="mt-4 bg-primary">Save Changes</Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
