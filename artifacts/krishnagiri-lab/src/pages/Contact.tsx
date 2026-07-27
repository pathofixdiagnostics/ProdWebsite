import { useSEO } from "@/hooks/useSEO";
import { BUSINESS_DETAILS } from "@/config/data";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  useSEO({
    title: "Contact Us",
    description: "Get in touch with Krishnagiri Diagnostic Laboratory for home collection and test bookings.",
  });

  return (
    <div className="w-full pb-16 sm:pb-20 overflow-x-hidden">
      <section className="bg-slate-50 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center border-b border-slate-200">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3">Contact Us</h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            We are here to assist you. Reach out for home collection, report queries, or test bookings.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Contact Details */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Get in Touch</h2>

              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-5 sm:p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg text-primary shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Laboratory Address</h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{BUSINESS_DETAILS.address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-5 sm:p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg text-primary shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Phone Numbers</h3>
                    <div className="space-y-1">
                      <p className="text-slate-600 text-sm sm:text-base">Mobile: <a href={`tel:${BUSINESS_DETAILS.mobile}`} className="text-primary font-medium hover:underline">{BUSINESS_DETAILS.mobile}</a></p>
                      <p className="text-slate-600 text-sm sm:text-base">Landline: <a href={`tel:${BUSINESS_DETAILS.phone}`} className="text-primary font-medium hover:underline">{BUSINESS_DETAILS.phone}</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-5 sm:p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg text-primary shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Email Address</h3>
                    <a href={`mailto:${BUSINESS_DETAILS.email}`} className="text-primary font-medium hover:underline block break-all text-sm sm:text-base">
                      {BUSINESS_DETAILS.email}
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-5 sm:p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg text-primary shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Working Hours</h3>
                    <div className="space-y-0.5 text-slate-600 text-sm sm:text-base">
                      <p>Mon – Sat: 8:00 AM – 8:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="h-[300px] sm:h-[400px] lg:h-auto min-h-[300px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <iframe
                src={BUSINESS_DETAILS.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
                className="w-full h-full grayscale-[0.2] contrast-[0.9]"
              ></iframe>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
