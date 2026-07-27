import { useSEO } from "@/hooks/useSEO";
import { BUSINESS_DETAILS, FACILITIES, TEST_PACKAGES } from "@/config/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Activity, Award, BadgePercent, HeartPulse, Droplets, FlaskConical, PhoneCall, Stethoscope } from "lucide-react";
import * as Icons from "lucide-react";
import { PromoBanner } from "@/components/PromoBanner";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  useSEO({
    title: "Advanced Diagnostic Laboratory",
    description: "Krishnagiri Diagnostic Laboratory offers fast, accurate & affordable lab testing with trusted medical experts in Krishnagiri.",
    keywords: "Diagnostic Laboratory in Krishnagiri, Blood Test Krishnagiri, Full Body Checkup Krishnagiri"
  });

  const topFacilities = FACILITIES.slice(0, 4);
  const topPackages = TEST_PACKAGES.slice(0, 4);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Running promo banner */}
      <PromoBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-14 md:pt-24 lg:pt-32 pb-16 lg:pb-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
        <div className="container relative mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl space-y-5"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-semibold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Trusted by 50,000+ Patients in Krishnagiri
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              {BUSINESS_DETAILS.tagline}
            </h1>
            <p className="text-base md:text-xl text-slate-600 max-w-2xl leading-relaxed">
              {BUSINESS_DETAILS.sub_tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button asChild size="lg" className="rounded-full h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base shadow-lg shadow-primary/25 w-full sm:w-auto">
                <Link href="/book">Book a Test Now <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-white/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5 w-full sm:w-auto">
                <Link href="/partner">Partner With Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative -mt-8 md:-mt-10 z-10 px-4 md:px-8 container mx-auto">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { line1: "10+",    line2: null,       label: "Years Experience", icon: Award },
              { line1: "50k+",   line2: null,       label: "Happy Patients",   icon: ShieldCheck },
              { line1: "300+",   line2: null,       label: "Tests Available",  icon: Activity },
              { line1: "DOCTOR", line2: null,         label: "Run Lab",          icon: Stethoscope },
            ].map((stat, i) => (
              <div key={i} className="text-center px-2 sm:px-4">
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary mb-2 sm:mb-3 opacity-80" />
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1 leading-tight">
                  {stat.line1}
                  {stat.line2 && <><br /><span className="font-normal">{stat.line2}</span></>}
                </h3>
                {stat.label && <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">World-Class Facilities</h2>
              <p className="text-base md:text-lg text-slate-600">Equipped with state-of-the-art technology to ensure precise and rapid results.</p>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5 shrink-0">
              <Link href="/facilities">View All Facilities <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {topFacilities.map((facility) => {
              const Icon = Icons[facility.icon as keyof typeof Icons] as React.ElementType;
              return (
                <motion.div key={facility.id} variants={fadeIn}>
                  <Card className="h-full border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-5 sm:p-6">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{facility.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{facility.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tests & Packages Preview */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">Popular Health Packages</h2>
            <p className="text-base md:text-lg text-slate-600">Comprehensive screening packages designed for your complete well-being.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10"
          >
            {topPackages.map((pkg) => {
              const Icon = Icons[pkg.icon as keyof typeof Icons] as React.ElementType;
              return (
                <motion.div key={pkg.id} variants={fadeIn}>
                  <Card className="h-full border-transparent shadow-md hover:shadow-xl transition-all group bg-white hover:-translate-y-1">
                    <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center mr-3 shrink-0">
                          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">{pkg.name}</h3>
                      </div>
                      <ul className="space-y-2 mb-5 flex-1">
                        {pkg.tests.slice(0, 3).map((test, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start">
                            <CheckCircle2 className="w-4 h-4 text-teal-500 mr-2 shrink-0 mt-0.5" />
                            {test}
                          </li>
                        ))}
                        {pkg.tests.length > 3 && (
                          <li className="text-sm text-slate-400 font-medium pl-6">
                            + {pkg.tests.length - 3} more tests
                          </li>
                        )}
                      </ul>
                      <Button asChild variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 text-sm">
                        <Link href="/book">Book Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
          <div className="text-center">
            <Button asChild size="lg" className="rounded-full shadow-md">
              <Link href="/tests">View All Packages</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Aarogya Wellness Card Section */}
      <section className="py-16 md:py-24 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — text content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-semibold mb-5">
                <BadgePercent className="w-4 h-4 text-teal-300" />
                Exclusive Membership Card
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Aarogya<br />
                <span className="text-teal-300">Wellness Card</span>
              </h2>
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                Enroll once and enjoy year-round savings on your health tests. The Aarogya Wellness Card is our way of making quality diagnostics affordable for every family in Krishnagiri.
              </p>

              <ul className="space-y-4 mb-9">
                {[
                  { icon: Droplets, text: "Flat 25% off on all Blood & Urine Tests" },
                  { icon: FlaskConical, text: "Priority sample collection — no waiting" },
                  { icon: HeartPulse, text: "Free health consultation on report collection" },
                  { icon: CheckCircle2, text: "Valid for your entire family for 1 year" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm sm:text-base text-white/90">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-slate-100 font-bold shadow-lg shadow-black/20 w-full sm:w-auto">
                  <Link href="/contact">Enquire About the Card <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  <a href={`tel:${BUSINESS_DETAILS.mobile}`}>
                    <PhoneCall className="mr-2 w-4 h-4" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Right — card visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                {/* Card */}
                <div className="rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 p-6 sm:p-8 shadow-2xl shadow-black/30">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                      <span className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">PathoFix Diagnostics</span>
                      <span className="text-white font-extrabold text-xl sm:text-2xl tracking-tight">AAROGYA</span>
                      <span className="text-white/80 font-semibold text-sm tracking-widest">WELLNESS CARD</span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <HeartPulse className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="h-2 rounded-full bg-white/25 w-3/4" />
                    <div className="h-2 rounded-full bg-white/15 w-1/2" />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Member Since</p>
                      <p className="text-white font-bold text-sm">2024 – 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Savings</p>
                      <p className="text-white font-extrabold text-2xl">25% OFF</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white text-primary rounded-2xl px-4 py-2 shadow-xl font-bold text-sm text-center leading-tight">
                  Save up to<br />
                  <span className="text-2xl text-primary">₹ 1000+</span><br />
                  per year
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
