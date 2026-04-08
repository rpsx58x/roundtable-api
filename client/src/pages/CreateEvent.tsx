import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  Utensils, Wine, Coffee, Trophy, Plane, Briefcase,
  MapPin, Calendar, Clock, Users, Link2, Upload, ArrowLeft, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const EVENT_TYPES = [
  { key: "dinner",  label: "Dinner",   icon: Utensils },
  { key: "drinks",  label: "Drinks",   icon: Wine },
  { key: "coffee",  label: "Coffee",   icon: Coffee },
  { key: "lunch",   label: "Lunch",    icon: Utensils },
  { key: "sports",  label: "Sports",   icon: Trophy },
  { key: "travel",  label: "Travel",   icon: Plane },
  { key: "other",   label: "Other",    icon: Briefcase },
];

const PLATFORMS = [
  { key: "resy",         label: "Resy",         color: "text-red-500" },
  { key: "opentable",    label: "OpenTable",    color: "text-green-600" },
  { key: "sevenrooms",   label: "SevenRooms",   color: "text-blue-500" },
  { key: "tock",         label: "Tock",         color: "text-purple-600" },
  { key: "eventbrite",   label: "Eventbrite",   color: "text-orange-500" },
  { key: "ticketmaster", label: "Ticketmaster", color: "text-blue-600" },
  { key: "none",         label: "No link",      color: "text-muted-foreground" },
];

export default function CreateEvent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    venue: "",
    address: "",
    city: "Miami, FL",
    date: new Date().toISOString().split("T")[0],
    time: "8:00 PM",
    type: "dinner",
    maxGuests: 4,
    description: "",
    bookingPlatform: "resy",
    bookingUrl: "",
    isPublic: true,
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/events", {
        ...form,
        hostId: 1, // current user
        maxGuests: Number(form.maxGuests),
        bookingPlatform: form.bookingPlatform === "none" ? null : form.bookingPlatform,
        bookingUrl: form.bookingUrl || null,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event created!", description: "Your event is now live." });
      navigate(`/app/events/${data.id}`);
    },
    onError: () => {
      toast({ title: "Something went wrong", variant: "destructive" });
    },
  });

  const isValid = form.venue.trim() && form.city.trim() && form.date && form.time;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-xl mx-auto w-full p-6 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate("/app/events")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Create an Event
            </h1>
            <p className="text-xs text-muted-foreground">Share your reservation or plan a meetup</p>
          </div>
        </div>

        {/* Event Type */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Event type</Label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => set("type", key)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  form.type === key
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Venue & Location */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Venue & Location
          </h2>
          <div className="grid gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Venue name *</Label>
              <Input
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="e.g. Carbone Miami"
                className="rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Address</Label>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="49 Collins Ave, Miami Beach"
                className="rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">City *</Label>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Miami, FL"
                className="rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Date & Time
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Time *</Label>
              <Input
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                placeholder="8:00 PM"
                className="rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Guests & Visibility */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Guests & Visibility
          </h2>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Max guests (including you)</Label>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => set("maxGuests", n)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${
                    form.maxGuests === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Public event</p>
              <p className="text-xs text-muted-foreground">Anyone on RoundTable can see and request to join</p>
            </div>
            <Switch
              checked={form.isPublic}
              onCheckedChange={(v) => set("isPublic", v)}
            />
          </div>
        </div>

        {/* Booking platform */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Booking Platform
          </h2>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => set("bookingPlatform", key)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  form.bookingPlatform === key
                    ? `border-primary bg-primary/8 ${color}`
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {form.bookingPlatform && form.bookingPlatform !== "none" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Booking URL (optional)</Label>
              <Input
                value={form.bookingUrl}
                onChange={(e) => set("bookingUrl", e.target.value)}
                placeholder="https://resy.com/..."
                className="rounded-xl text-sm"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Description (optional)</Label>
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Tell people what to expect — who you are, what you're looking for, dress code, etc."
            className="rounded-xl text-sm min-h-[100px]"
          />
        </div>

        {/* Upload tickets */}
        <div className="rounded-xl border border-dashed border-border p-5 text-center">
          <Upload className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Upload existing reservation or tickets</p>
          <p className="text-xs text-muted-foreground mb-3">PDF, screenshot, or confirmation email • Max 10MB</p>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Choose file
          </Button>
        </div>

        {/* Submit */}
        <Button
          className="w-full py-6 text-base font-semibold rounded-xl gap-2"
          onClick={() => createMutation.mutate()}
          disabled={!isValid || createMutation.isPending}
        >
          <CheckCircle className="w-5 h-5" />
          {createMutation.isPending ? "Creating..." : "Publish Event"}
        </Button>
      </div>
    </div>
  );
}
