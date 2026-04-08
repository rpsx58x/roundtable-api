import { useState } from "react";
import { useLocation } from "wouter";
import { FaLinkedin } from "react-icons/fa";
import { CheckCircle, MapPin, ArrowRight, Briefcase, GraduationCap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoundTableLogo } from "@/components/RoundTableLogo";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const MOCK_LINKEDIN = {
  name: "Rich Schilling",
  email: "rich@schilltech.com",
  title: "VP of Operations",
  company: "SchillTech",
  industry: "Technology",
  school: "Georgetown University",
  avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=rich&backgroundColor=b6e3f4",
  workHistory: [
    { company: "SchillTech", title: "VP of Operations", years: "2021 – Present" },
    { company: "JLL", title: "Director of Operations", years: "2018 – 2021" },
    { company: "CBRE", title: "Senior Manager", years: "2014 – 2018" },
  ],
};

type Step = "connect" | "preview" | "location" | "done";

export default function Onboarding() {
  const [step, setStep] = useState<Step>("connect");
  const [city, setCity] = useState("Miami, FL");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLinkedIn = () => {
    // Simulate OAuth flow with a brief delay
    setTimeout(() => setStep("preview"), 1200);
  };

  const handleLocation = async () => {
    try {
      await apiRequest("PATCH", "/api/me/city", { city, lat: 25.7617, lng: -80.1918 });
    } catch (_) {
      // ignore — demo mode
    }
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <RoundTableLogo size="lg" />
        </div>

        {/* Step: Connect */}
        {step === "connect" && (
          <div className="fade-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center mx-auto mb-6">
              <FaLinkedin className="w-8 h-8 text-[#0A66C2]" />
            </div>
            <h1
              className="text-3xl font-semibold text-foreground mb-3"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Connect your LinkedIn
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We pull your title, company, industry, education, and work history automatically. No manual setup.
            </p>

            <div className="space-y-3 text-left mb-8">
              {[
                "Current role & company",
                "Work history & tenure",
                "Industry & skills",
                "Education & credentials",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <Button
              className="w-full gap-2.5 py-6 text-base font-semibold rounded-xl bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
              onClick={handleLinkedIn}
            >
              <FaLinkedin className="w-5 h-5" />
              Continue with LinkedIn
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              We never post on your behalf or share your data with third parties.
            </p>

            <div className="mt-8">
              <button
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                onClick={() => navigate("/app")}
              >
                Skip for now — explore the demo
              </button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && (
          <div className="fade-up">
            <div className="text-center mb-6">
              <div className="w-5 h-5 text-primary inline-block mb-2">
                <CheckCircle className="w-5 h-5 text-primary mx-auto" />
              </div>
              <h1
                className="text-3xl font-semibold text-foreground mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Profile imported
              </h1>
              <p className="text-sm text-muted-foreground">Here's what we pulled from LinkedIn</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <img
                  src={MOCK_LINKEDIN.avatar}
                  className="w-14 h-14 rounded-full border-2 border-primary/20 bg-secondary"
                  alt="Profile"
                />
                <div>
                  <p className="font-semibold text-foreground">{MOCK_LINKEDIN.name}</p>
                  <p className="text-sm text-muted-foreground">{MOCK_LINKEDIN.title}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{MOCK_LINKEDIN.company}</span>
                  <span className="text-muted-foreground">· {MOCK_LINKEDIN.industry}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{MOCK_LINKEDIN.school}</span>
                </div>
              </div>

              {/* Work history */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Work History
                </p>
                <div className="space-y-2">
                  {MOCK_LINKEDIN.workHistory.map((w) => (
                    <div key={w.company} className="flex items-start justify-between text-sm">
                      <div>
                        <span className="text-foreground font-medium">{w.title}</span>
                        <span className="text-muted-foreground"> · {w.company}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-3 flex-shrink-0">{w.years}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-5 gap-2 py-6 text-base font-semibold rounded-xl"
              onClick={() => setStep("location")}
            >
              Looks good — next step
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step: Location */}
        {step === "location" && (
          <div className="fade-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h1
              className="text-3xl font-semibold text-foreground mb-3"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Where are you?
            </h1>
            <p className="text-muted-foreground mb-8">
              Set your current city so professionals nearby can find you. You can change this anytime.
            </p>

            <div className="text-left space-y-4 mb-6">
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Current city</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Miami, FL"
                  className="py-6 text-base rounded-xl"
                />
              </div>
            </div>

            <Button
              className="w-full gap-2 py-6 text-base font-semibold rounded-xl"
              onClick={handleLocation}
              disabled={!city.trim()}
            >
              <MapPin className="w-4 h-4" />
              Set my location
            </Button>

            <button
              className="mt-4 text-sm text-muted-foreground underline underline-offset-4"
              onClick={() => navigate("/app")}
            >
              Use my device location instead
            </button>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="fade-up text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1
              className="text-3xl font-semibold text-foreground mb-3"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Welcome to the table.
            </h1>
            <p className="text-muted-foreground mb-2">
              You're now visible to professionals in <strong>{city}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              6 professionals in your industry are nearby right now.
            </p>
            <Button
              className="w-full gap-2 py-6 text-base font-semibold rounded-xl"
              onClick={() => navigate("/app")}
            >
              Discover who's nearby
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {(["connect", "preview", "location", "done"] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
