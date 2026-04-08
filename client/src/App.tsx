import { useEffect } from "react";
import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { initNativeApp, onBackButton } from "@/lib/native";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import AppShell from "@/pages/AppShell";

function AppInner() {
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Initialize Capacitor native features on first mount
    initNativeApp();

    // Handle Android hardware back button
    onBackButton(() => {
      if (location !== "/" && location !== "/app" && location !== "/app/discover") {
        navigate(-1 as any);
        return true; // consumed
      }
      return false; // let system handle (exit)
    });
  }, []);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/app" component={() => <AppShell />} />
      <Route path="/app/:page" component={() => <AppShell />} />
      <Route path="/app/:page/:id" component={() => <AppShell />} />
      <Route component={Landing} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <AppInner />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
