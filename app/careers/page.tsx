"use client";

import Link from "next/link";
import { Briefcase, Heart, Mail, MapPin, Users } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { businessProfile } from "@/lib/siteContent";

const roles = [
  "Aquarium care specialist",
  "Store sales associate",
  "Pet grooming assistant",
  "Delivery partner",
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <Navigation />

      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Briefcase className="w-12 h-12 mx-auto mb-5" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Careers</h1>
          <p className="text-white/85 text-lg">
            Join Rainbow Aquarium & Pets and help Tirunelveli families care for fish, birds, and pets with confidence.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1fr_0.8fr] gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-5">Open Interest Areas</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <Heart className="w-5 h-5 text-secondary mb-3" />
                  <h3 className="font-semibold text-slate-900">{role}</h3>
                  <p className="text-sm text-slate-600 mt-2">Send us your details and availability.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-5">
            <h2 className="text-2xl font-bold">Apply or Enquire</h2>
            <p className="text-slate-600">
              We review applications directly at the store. Share your experience, role preference, and contact number.
            </p>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a className="hover:text-primary break-all" href={`mailto:${businessProfile.email}`}>
                  {businessProfile.email}
                </a>
              </p>
              <p className="flex gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0" />
                Call / WhatsApp: {businessProfile.phoneDisplay}
              </p>
              <p className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                Palayamkottai, Tirunelveli
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/contact">Contact the Store</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
