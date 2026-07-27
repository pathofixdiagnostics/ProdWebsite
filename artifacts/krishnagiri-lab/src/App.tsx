import { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "./components/layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Facilities from "./pages/Facilities";
import Tests from "./pages/Tests";
import Partner from "./pages/Partner";
import Contact from "./pages/Contact";
import BookTest from "./pages/BookTest";
import Admin from "./pages/Admin";
import { trackPageview } from "./lib/analytics";

const queryClient = new QueryClient();

function RedirectHome() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/"); }, []);
  return null;
}

// The public marketing site, wrapped in the shared Navbar/Footer layout.
function PublicSite() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/facilities" component={Facilities} />
        <Route path="/tests" component={Tests} />
        <Route path="/partner" component={Partner} />
        <Route path="/contact" component={Contact} />
        <Route path="/book" component={BookTest} />
        <Route component={RedirectHome} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const [location] = useLocation();

  // In-house page-view tracking on every route change (skips /admin).
  useEffect(() => {
    trackPageview(location);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      {/* Admin console renders standalone, without the marketing layout */}
      <Route path="/admin" component={Admin} />
      <Route>
        <PublicSite />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
