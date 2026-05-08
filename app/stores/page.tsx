"use client";

import { Clock, MapPin, Navigation as NavigationIcon, Phone } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { businessProfile } from "@/lib/siteContent";

export default function StoreLocatorPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <Navigation />

      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <MapPin className="w-12 h-12 mx-auto mb-5" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Store Locator</h1>
          <p className="text-white/85 text-lg">
            Visit Rainbow Aquarium & Pets in Palayamkottai for aquarium fish, birds, food, and pet supplies.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{businessProfile.name}</h2>
              <p className="text-slate-600 mt-2">{businessProfile.category}</p>
            </div>

            <div className="space-y-4 text-slate-700">
              <p className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  {businessProfile.addressLines[0]}
                  <br />
                  {businessProfile.addressLines[1]}
                </span>
              </p>
              <p className="flex gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={`tel:${businessProfile.phone}`} className="hover:text-primary">
                  {businessProfile.phoneDisplay}
                </a>
              </p>
              <p className="flex gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                Open daily: 9 am-11 pm
              </p>
            </div>

            <Button asChild className="w-full">
              <a href={businessProfile.directionsUrl} target="_blank" rel="noopener noreferrer">
                <NavigationIcon className="w-4 h-4 mr-2" />
                Get Directions
              </a>
            </Button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border min-h-[420px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.8976823882677!2d77.69374731478257!3d8.727612493714756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04119e3bacd855%3A0x9f3b8d6b3e5e2e0a!2sTirunelveli%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "420px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Rainbow Aquarium & Pets Store Location"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
