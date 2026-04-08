import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Calendar, MapPin, Users, Clock, Plus, ExternalLink, Filter,
  Utensils, Coffee, Wine, Plane, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event, User } from "@shared/schema";

const EVENT_TYPES = [
  { key: "all", label: "All", icon: Filter },
  { key: "dinner", label: "Dinner", icon: Utensils },
  { key: "drinks", label: "Drinks", icon: Wine },
  { key: "coffee", label: "Coffee", icon: Coffee },
  { key: "sports", label: "Sports", icon: Trophy },
  { key: "travel", label: "Travel", icon: Plane },
];

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  resy:        { label: "Resy", color: "text-red-500 dark:text-red-400" },
  opentable:   { label: "OpenTable", color: "text-green-600 dark:text-green-400" },
  sevenrooms:  { label: "SevenRooms", color: "text-blue-500 dark:text-blue-400" },
  tock:        { label: "Tock", color: "text-purple-600 dark:text-purple-400" },
  eventbrite:  { label: "Eventbrite", color: "text-orange-500 dark:text-orange-400" },
  ticketmaster:{ label: "Ticketmaster", color: "text-blue-600 dark:text-blue-400" },
};

const TYPE_EMOJI: Record<string, string> = {
  dinner: "🍽️", drinks: "🍸", coffee: "☕", lunch: "🥗",
  sports: "🏀", travel: "✈️", other: "📍",
};

export default function Events() {
  const [, navigate] = useLocation();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: me } = useQuery<User>({ queryKey: ["/api/me"] });
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", { city: me?.currentCity }],
    queryFn: () => fetch(`/api/events?city=${encodeURIComponent(me?.currentCity || "Miami, FL")}`).then(r => r.json()),
    enabled: !!me,
  });

  const filtered = typeFilter === "all" ? events : events.filter(e => e.type === typeFilter);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Events
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {me?.currentCity || "Miami, FL"} · {filtered.length} open
            </p>
          </div>
          <Button
            className="gap-2 rounded-xl text-sm"
            onClick={() => navigate("/app/create")}
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {EVENT_TYPES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-28 mb-4" />
                <Skeleton className="h-16 w-full mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              No events found
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Be the first to create one
            </p>
            <Button onClick={() => navigate("/app/create")} className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} onView={() => navigate(`/app/events/${event.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onView }: { event: Event; onView: () => void }) {
  const spotsLeft = (event.maxGuests ?? 4) - (event.currentGuests ?? 1);
  const platform = event.bookingPlatform ? PLATFORM_LABELS[event.bookingPlatform] : null;
  const emoji = TYPE_EMOJI[event.type] || "📍";

  return (
    <div className="p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/25 transition-all duration-200 prof-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full badge-${event.type}`}>
              {emoji} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </span>
            {spotsLeft > 0 && (
              <span className="text-xs text-muted-foreground">{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight">{event.title}</h3>
        </div>
        {platform && (
          <span className={`text-xs font-medium flex-shrink-0 ${platform.color}`}>
            {platform.label}
          </span>
        )}
      </div>

      {/* Venue & time */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{event.venue}{event.address ? ` · ${event.address.split(",")[0]}` : ""}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{event.currentGuests}/{event.maxGuests} attending</span>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Attendee dots (fake) */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(event.currentGuests ?? 1, 4) }, (_, i) => (
            <img
              key={i}
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${event.id}-${i}&backgroundColor=b6e3f4,ffd5dc,c0aede`}
              className="w-7 h-7 rounded-full border-2 border-card bg-secondary"
              alt="attendee"
            />
          ))}
        </div>
        {spotsLeft > 0 && (
          <span className="text-xs text-muted-foreground">+{spotsLeft} open</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 rounded-xl text-xs font-medium"
          onClick={onView}
        >
          View & Join
        </Button>
        {event.bookingUrl && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs gap-1.5"
            onClick={(e) => { e.stopPropagation(); window.open(event.bookingUrl!, "_blank"); }}
          >
            <ExternalLink className="w-3 h-3" />
            Book
          </Button>
        )}
      </div>
    </div>
  );
}
