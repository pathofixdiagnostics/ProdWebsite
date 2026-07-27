import { Link } from "wouter";
import { BUSINESS_DETAILS } from "@/config/data";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="PATHOFIX DIAGNOSTICS"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <span className="font-bold text-xl text-white tracking-tight flex flex-col leading-none">
                <span className="text-purple-300 font-extrabold">PATHOFIX</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Diagnostics</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              "Cell is our Priority"
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              {BUSINESS_DETAILS.sub_tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Facilities", href: "/facilities" },
                { label: "Tests & Packages", href: "/tests" },
                { label: "Partner With Us", href: "/partner" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-purple-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-slate-400">
                <MapPin className="w-5 h-5 mr-3 text-purple-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_DETAILS.address}</span>
              </li>
              <li className="flex items-center text-sm text-slate-400">
                <Phone className="w-5 h-5 mr-3 text-purple-400 shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${BUSINESS_DETAILS.mobile}`} className="hover:text-white transition-colors">{BUSINESS_DETAILS.mobile}</a>
                  <a href={`tel:${BUSINESS_DETAILS.phone}`} className="hover:text-white transition-colors">{BUSINESS_DETAILS.phone}</a>
                </div>
              </li>
              <li className="flex items-center text-sm text-slate-400">
                <Mail className="w-5 h-5 mr-3 text-purple-400 shrink-0" />
                <a href={`mailto:${BUSINESS_DETAILS.email}`} className="hover:text-white transition-colors break-all">{BUSINESS_DETAILS.email}</a>
              </li>
            </ul>
          </div>

          {/* Timing */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">Working Hours</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-slate-400">
                <Clock className="w-5 h-5 mr-3 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Monday – Saturday</p>
                  <p>8:00 AM – 8:00 PM</p>
                </div>
              </li>
              <li className="flex items-start text-sm text-slate-400">
                <Clock className="w-5 h-5 mr-3 text-purple-400 shrink-0 mt-0.5 opacity-0" />
                <div>
                  <p className="text-white font-medium mb-1">Sunday</p>
                  <p>Closed</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {BUSINESS_DETAILS.name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0 italic">Cell is our Priority.</p>
        </div>
      </div>
    </footer>
  );
}
