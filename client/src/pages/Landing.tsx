import { useLocation } from "wouter";
import { MapPin, Users, Calendar, MessageCircle, ArrowRight, Star, Coffee, Utensils, Wine, Plane, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaLinkedin } from "react-icons/fa";
import { RoundTableLogo } from "@/components/RoundTableLogo";

const FEATURES = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Find Your People",
    desc: "Filter by industry, title, and company. Discover professionals with shared interests wherever you land.",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Real Plans, Real Places",
    desc: "Share your reservation at Carbone, invite strangers to join, or browse open events nearby.",
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Message & Coordinate",
    desc: "Chat directly, coordinate logistics, and build connections that last beyond the trip.",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Location Intelligence",
    desc: "Geolocation or manual city setting. See who's in town tonight — right now.",
  },
];

const SCENARIOS = [
  {
    icon: <Utensils className="w-4 h-4" />,
    label: "Dinner",
    title: '"I\'m in Miami for the week"',
    desc: "Flew in for a real estate deal. Found 4 professionals in my industry, got invited to a Carbone dinner, and made two lasting connections.",
  },
  {
    icon: <Coffee className="w-4 h-4" />,
    label: "Coffee",
    title: '"Coffee before my 10am meeting"',
    desc: "Posted a coffee spot near my hotel. Three tech founders joined. Ended up with a partnership conversation I didn't expect.",
  },
  {
    icon: <Wine className="w-4 h-4" />,
    label: "Sports",
    title: '"Extra tickets to the game"',
    desc: "Had two floor seats I couldn't fill. Two finance guys from the app showed up. Incredible night, zero awkwardness.",
  },
  {
    icon: <Plane className="w-4 h-4" />,
    label: "Travel",
    title: '"Traveling to Tokyo next week"',
    desc: "Set my future location in advance. Got messages from three professionals before my flight even landed.",
  },
];

const PLATFORMS = ["Resy", "OpenTable", "SevenRooms", "Tock", "Eventbrite", "SeatGeek", "Ticketmaster"];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-border/50">
        <RoundTableLogo />
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-sm font-medium"
            onClick={() => navigate("/app")}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            className="gap-2 text-sm font-medium rounded-xl px-4"
            onClick={() => navigate("/onboarding")}
          >
            <FaLinkedin className="w-4 h-4" />
            Connect LinkedIn
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=85')` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium mb-8">
            <Star className="w-3 h-3 fill-current" />
            Professional social networking, in the real world
          </div>

          <h1
            className="text-5xl md:text-7xl font-semibold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Meet the right people,
            <br />
            <span className="gold-gradient">wherever you are.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Link your LinkedIn, set your city, and discover professionals nearby — whether you're home or flying across the country for work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="gap-2.5 px-8 py-6 text-base font-semibold rounded-xl shadow-lg"
              onClick={() => navigate("/onboarding")}
            >
              <FaLinkedin className="w-5 h-5" />
              Connect with LinkedIn
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-base font-medium rounded-xl border-white/30 text-white bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/app")}
            >
              Explore the demo
            </Button>
          </div>

          <p className="text-xs text-white/40 mt-6">
            Pulls your work history, title, industry, and education. No manual setup needed.
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs">Scroll to learn more</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-semibold text-foreground mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Networking that actually happens
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            No cold messages sitting unread. Real plans, real people, real conversations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/18 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-24 px-6 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Your next great connection <br />
              <em>is already in town</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SCENARIOS.map((s) => (
              <div key={s.title} className="p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {s.icon}
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{s.label}</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-semibold text-foreground mb-4"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Book directly. Invite effortlessly.
        </h2>
        <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
          Link your Resy or OpenTable reservation. Upload tickets for sports or concerts. Share open seats with people worth meeting.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {PLATFORMS.map((p) => (
            <span key={p} className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground/80 hover:border-primary/40 transition-colors cursor-default">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-6 bg-secondary/20 border-y border-border">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Verified LinkedIn profiles only — no anonymous accounts</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-border" />
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Location shared only when you choose to be visible</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-border" />
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground">You control who can message you and see your events</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-primary/25 bg-gradient-to-br from-card to-secondary/40 p-12">
          <RoundTableLogo size="lg" textClass="text-foreground" />
          <h2
            className="text-3xl md:text-5xl font-semibold text-foreground mt-6 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ready to pull up a chair?
          </h2>
          <p className="text-muted-foreground mb-8">Connect your LinkedIn in 30 seconds. Your profile builds itself.</p>
          <Button
            size="lg"
            className="gap-2.5 px-10 py-6 text-base font-semibold rounded-xl"
            onClick={() => navigate("/onboarding")}
          >
            <FaLinkedin className="w-5 h-5" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <RoundTableLogo size="sm" />
          <p className="text-xs text-muted-foreground">© 2026 RoundTable. Professional networking, in the real world.</p>
        </div>
      </footer>
    </div>
  );
}
