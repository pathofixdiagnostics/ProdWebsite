import { useSEO } from "@/hooks/useSEO";
import { BUSINESS_DETAILS } from "@/config/data";
import { motion } from "framer-motion";
import { Award, ShieldCheck, Microscope, Users } from "lucide-react";

export default function About() {
  useSEO({
    title: "About Us",
    description: "Learn more about Krishnagiri Diagnostic Laboratory. We are committed to providing fast, accurate, and affordable lab testing.",
  });

  return (
    <div className="w-full pb-16 sm:pb-20 overflow-x-hidden">
      {/* Header */}
      <section className="bg-primary pt-16 sm:pt-24 pb-12 sm:pb-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">About Us</h1>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            A legacy of trust, precision, and excellence in clinical diagnostics for the Krishnagiri community.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-14 sm:mb-20">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">Our Mission</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                At {BUSINESS_DETAILS.name}, our mission is to empower patients and physicians with highly accurate, timely, and comprehensive diagnostic insights. We believe that precise diagnostics form the foundation of effective healthcare.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Serving the Krishnagiri community, we have consistently upgraded our technology and methodologies to remain at the forefront of medical pathology.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-3xl translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1000&auto=format&fit=crop"
                alt="Laboratory Technicians"
                className="rounded-3xl relative z-10 w-full h-[280px] sm:h-[360px] md:h-[400px] object-cover shadow-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              { icon: ShieldCheck, title: "NABL Compliant", desc: "Following strict national quality protocols." },
              { icon: Microscope, title: "Modern Tech", desc: "Fully automated clinical analyzers." },
              { icon: Users, title: "Expert Staff", desc: "Highly trained pathologists & technicians." },
              { icon: Award, title: "High Accuracy", desc: "Reliable reports you can trust." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 p-4 sm:p-6 rounded-2xl text-center border border-slate-100"
              >
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
