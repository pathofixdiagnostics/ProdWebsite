import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, PhoneCall } from "lucide-react";
import { useState, useEffect } from "react";
import { BUSINESS_DETAILS } from "@/config/data";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/facilities", label: "Facilities" },
  { href: "/tests", label: "Tests & Packages" },
  { href: "/partner", label: "Partner With Us" },
  { href: "/book", label: "Book a Test" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-white border-b border-transparent"
      }`}
    >
      {/* Top Bar */}
      <div className="hidden md:flex bg-primary text-primary-foreground py-1.5 text-xs font-medium px-4 md:px-8 justify-between items-center">
        <div className="flex items-center space-x-4">
          <a href={`tel:${BUSINESS_DETAILS.mobile}`} className="flex items-center hover:opacity-80 transition-opacity">
            <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
            {BUSINESS_DETAILS.mobile}
          </a>
          <span className="opacity-60">|</span>
          <a href={`mailto:${BUSINESS_DETAILS.email}`} className="hover:opacity-80 transition-opacity">
            {BUSINESS_DETAILS.email}
          </a>
        </div>
        <div className="flex items-center">
          <span>Mon – Sat: 8:00 AM – 8:00 PM</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group" data-testid="link-logo">
          <img
            src="/logo.png"
            alt="PATHOFIX DIAGNOSTICS"
            className="h-10 w-10 rounded-lg object-cover shadow-sm"
          />
          <span className="font-bold text-base md:text-lg text-foreground tracking-tight flex flex-col leading-none">
            <span className="text-primary font-extrabold">PATHOFIX</span>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Diagnostics</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                location === link.href
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:text-primary hover:bg-muted"
              }`}
              data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pl-4 ml-2 border-l border-border">
            <Button asChild className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold" data-testid="button-book-test">
              <Link href="/book">Book a Test</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                  location === link.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-2">
              <Button asChild className="w-full rounded-full" data-testid="button-book-test-mobile">
                <Link href="/book">Book a Test</Link>
              </Button>
            </div>
            <div className="pt-2 pb-2 flex flex-col space-y-2 text-sm text-muted-foreground border-t border-border mt-2">
              <a href={`tel:${BUSINESS_DETAILS.mobile}`} className="flex items-center justify-center p-2 bg-muted rounded-lg" data-testid="link-mobile-call">
                <PhoneCall className="w-4 h-4 mr-2" /> Call: {BUSINESS_DETAILS.mobile}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
