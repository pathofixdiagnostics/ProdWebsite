import { BUSINESS_DETAILS } from "@/config/data";
import { PhoneCall } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      <a
        href={`tel:${BUSINESS_DETAILS.mobile}`}
        className="bg-white text-primary p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl border border-border hover:bg-primary/5 transition-all hover:scale-110 flex items-center justify-center"
        aria-label="Call Now"
      >
        <PhoneCall className="w-6 h-6 md:w-7 md:h-7" />
      </a>
      <a
        href={`https://wa.me/${BUSINESS_DETAILS.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
        aria-label="WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7 md:w-8 md:h-8" />
      </a>
    </div>
  );
}
