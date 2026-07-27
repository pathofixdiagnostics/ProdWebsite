import { useMemo, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { TEST_CATALOG } from "@/config/data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { CheckCircle2, Search, X, FlaskConical, HeartPulse } from "lucide-react";
import * as Icons from "lucide-react";

type Panel = { name: string; tests: string[] };
type Category = {
  id: string;
  name: string;
  icon: string;
  tests?: string[];
  panels?: Panel[];
};

const CATALOG = TEST_CATALOG as unknown as Category[];

function categoryTestCount(cat: Category): number {
  if (cat.panels) return cat.panels.reduce((sum, p) => sum + p.tests.length, 0);
  return cat.tests?.length ?? 0;
}

const TOTAL_TESTS = CATALOG.reduce((sum, c) => sum + categoryTestCount(c), 0);

/** Wraps the matched part of a test name in a purple highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-primary/15 text-primary rounded px-0.5">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

export default function Tests() {
  useSEO({
    title: "Tests & Packages",
    description:
      "Browse PathoFix Diagnostics' full range of blood tests, urine tests, health profiles and histopathology services in Krishnagiri.",
  });

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const byChip = CATALOG.filter((c) => activeCat === "all" || c.id === activeCat);
    if (!q) return byChip;

    const result: Category[] = [];
    for (const cat of byChip) {
      // Whole category matches by name → show it in full
      if (cat.name.toLowerCase().includes(q)) {
        result.push(cat);
        continue;
      }
      if (cat.panels) {
        const panels = cat.panels
          .map((p) =>
            p.name.toLowerCase().includes(q)
              ? p
              : { ...p, tests: p.tests.filter((t) => t.toLowerCase().includes(q)) },
          )
          .filter((p) => p.tests.length > 0);
        if (panels.length > 0) result.push({ ...cat, panels });
        continue;
      }
      const tests = (cat.tests ?? []).filter((t) => t.toLowerCase().includes(q));
      if (tests.length > 0) result.push({ ...cat, tests });
    }
    return result;
  }, [q, activeCat]);

  const visibleTestCount = filtered.reduce((sum, c) => sum + categoryTestCount(c), 0);

  return (
    <div className="w-full pb-16 sm:pb-20 overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="container relative mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Tests &amp; Packages
          </h1>
          <p className="text-base sm:text-lg text-purple-50/90 max-w-2xl mx-auto">
            Comprehensive screening profiles and individual investigations designed for specific health needs.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm font-semibold text-white">
            <FlaskConical className="w-4 h-4" />
            {TOTAL_TESTS}+ investigations across {CATALOG.length} departments
          </p>
        </div>
      </section>

      {/* Individual Tests & Health Profiles */}
      <section className="py-12 sm:py-16 pb-4 sm:pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Individual Tests &amp; Health Profiles
            </h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
              Browse our full menu of investigations by department, or search for a specific test.
            </p>
            {/* Aarogya Wellness Card offer highlight */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs sm:text-sm font-semibold text-primary">
              <HeartPulse className="w-4 h-4 shrink-0" />
              Aarogya Wellness Card members get <span className="text-teal-600 font-bold mx-1">Flat 25% off</span> on all Blood &amp; Urine Tests
            </div>
          </div>

          {/* Search + category filter toolbar */}
          <div className="sticky top-16 z-30 mb-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-sm p-3 sm:p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a test — e.g. HbA1c, Ferritin, Pap Smear…"
                aria-label="Search tests"
                className="pl-10 sm:pl-11 pr-10 h-11 sm:h-12 rounded-xl border-slate-200 focus-visible:ring-primary/40 text-sm sm:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold border transition-colors ${
                  activeCat === "all"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                }`}
              >
                All Departments
              </button>
              {CATALOG.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(activeCat === cat.id ? "all" : cat.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold border transition-colors ${
                    activeCat === cat.id
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {(q || activeCat !== "all") && (
              <p className="text-xs sm:text-sm text-slate-500 px-1">
                Showing <span className="font-semibold text-primary">{visibleTestCount}</span>{" "}
                {visibleTestCount === 1 ? "test" : "tests"}
                {q && (
                  <>
                    {" "}matching “<span className="font-semibold text-slate-700">{query.trim()}</span>”
                  </>
                )}{" "}
                ·{" "}
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCat("all");
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Reset
                </button>
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
              <FlaskConical className="w-10 h-10 mx-auto text-primary/40 mb-4" />
              <p className="text-slate-700 font-semibold mb-1">No tests found for “{query.trim()}”</p>
              <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
                Try a different spelling, or contact us — we run many more investigations than listed here.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => {
                    setQuery("");
                    setActiveCat("all");
                  }}
                >
                  Clear Search
                </Button>
                <Button asChild>
                  <Link href="/contact">Ask Us</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {filtered.map((cat) => {
                const Icon = Icons[cat.icon as keyof typeof Icons] as React.ElementType;
                const count = categoryTestCount(cat);
                return (
                  <Card
                    key={cat.id}
                    className="flex flex-col border-slate-200 hover:border-primary transition-colors shadow-sm hover:shadow-xl group"
                  >
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-5 sm:p-6 rounded-t-xl">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg shadow-sm text-primary group-hover:scale-110 transition-transform shrink-0">
                          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                          {cat.name}
                        </CardTitle>
                        <span className="ml-auto shrink-0 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-bold px-2.5 py-1">
                          {count} {count === 1 ? "test" : "tests"}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6 flex-1">
                      {cat.panels ? (
                        <div className="space-y-5">
                          {cat.panels.map((panel) => (
                            <div key={panel.name}>
                              <p className="inline-block rounded-md bg-primary/10 text-primary font-semibold text-xs sm:text-sm px-2.5 py-1 mb-2.5">
                                <Highlight text={panel.name} query={q} />
                              </p>
                              <ul className="space-y-2">
                                {panel.tests.map((test, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start text-slate-700 text-sm sm:text-base"
                                  >
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 shrink-0 mt-0.5" />
                                    <span>
                                      <Highlight text={test} query={q} />
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-xs sm:text-sm text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
                            Tests Included:
                          </p>
                          <ul className="space-y-2 sm:space-y-3">
                            {(cat.tests ?? []).map((test, idx) => (
                              <li
                                key={idx}
                                className="flex items-start text-slate-700 text-sm sm:text-base"
                              >
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 shrink-0 mt-0.5" />
                                <span>
                                  <Highlight text={test} query={q} />
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </CardContent>

                    <CardFooter className="p-5 sm:p-6 pt-0">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full font-semibold text-sm sm:text-base h-11 sm:h-12 border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <Link href="/book">Book This Test</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
