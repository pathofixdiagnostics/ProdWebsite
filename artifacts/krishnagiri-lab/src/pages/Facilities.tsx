import { useSEO } from "@/hooks/useSEO";
import { FACILITIES } from "@/config/data";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

export default function Facilities() {
  useSEO({
    title: "Our Facilities",
    description: "Explore the advanced medical testing facilities available at Krishnagiri Diagnostic Laboratory.",
  });

  return (
    <div className="w-full pb-20">
      <section className="bg-slate-50 pt-20 pb-16 text-center border-b border-slate-200">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Facilities</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            State-of-the-art diagnostic equipment and fully automated analyzers ensuring absolute precision in every report.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FACILITIES.map((facility, i) => {
              const Icon = Icons[facility.icon as keyof typeof Icons] as React.ElementType;
              return (
                <motion.div 
                  key={facility.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {Icon && <Icon className="w-7 h-7" />}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{facility.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{facility.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
