import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  ArrowLeft, MapPin, Clock, Users, ExternalLink, MessageCircle,
  CheckCircle, Upload, Share2, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, User } from "@shared/schema";

const PLATFORM_LABELS: Record<string, { label: string; color: string; url?: string }> = {
  resy:         { label: "Book on Resy", color: "text-red-500" },
  opentable:    { label: "Book on OpenTable", color: "text-green-600" },
  sevenrooms:   { label: "Book on SevenRooms", color: "text-blue-500" },
  tock:         { label: "Book on Tock", color: "text-purple-600" },
  eventbrite:   { label: "View on Eventbrite", color: "text-orange-500" },
  ticketmaster: { label: "View on Ticketmaster", color: "text-blue-600" },
};

const TYPE_EMOJI: Record<string, string> = {
  dinner: "🍽️", drinks: "🍸", coffee: "☕", lunch: "🥗",
  sports: "🏀", travel: "✈️", other: "📍",
};

export default function EventDetail({ eventId }: { eventId: number }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: event, isLoading: loadingEvent } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    queryFn: () => fetch(`/api/events/${eventId}`).then(r => r.json()),
  });

  const { data: me } = useQuery<User>({ queryKey: ["/api/me"] });

  const { data: attendees = [], isLoading: loadingAttendees } = useQuery<User[]>({
    queryKey: ["/api/events", eventId, "attendees"],
    queryFn: () => fetch(`/api/events/${eventId}/attendees`).then(r => r.json()),
    enabled: !!event,
  });

  const { data: host } = useQuery<User>({
    queryKey: ["/api/users", event?.hostId],
    queryFn: () => fetch(`/api/users/${event?.hostId}`).then(r => r.json()),
    enabled: !!event?.hostId,
  });

  const joinMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/events/${eventId}/join`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({ title: "You've joined!", description: "The host will be notified." });
    },
  });

  if (loadingEvent) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-32 w-full rounded-2xl mb-4" />
      </div>
    );
  }

  if (!event) return (
    <div className="flex items-center justify-center h-full text-muted-foreground">Event not found</div>
  );

  const spotsLeft = (event.maxGuests ?? 4) - (event.currentGuests ?? 1);
  const platform = event.bookingPlatform ? PLATFORM_LABELS[event.bookingPlatform] : null;
  const emoji = TYPE_EMOJI[event.type] || "📍";
  const dateStr = new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const isHost = me?.id === event.hostId;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full p-6 space-y-6 pb-12">
        {/* Back */}
        <button
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate("/app/events")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {/* Hero */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6">
            {/* Type & spots */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full badge-${event.type}`}>
                {emoji} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </span>
              <div className="flex items-center gap-2">
                {spotsLeft > 0 ? (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Users className="w-3 h-3" />
                    {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">Full</Badge>
                )}
              </div>
            </div>

            <h1
              className="text-2xl font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {event.title}
            </h1>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{event.venue}</p>
                  {event.address && <p className="text-xs text-muted-foreground mt-0.5">{event.address}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{dateStr}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{event.description}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              {!isHost && spotsLeft > 0 && (
                <Button
                  className="gap-2 rounded-xl flex-1 min-w-[120px]"
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4" />
                  {joinMutation.isPending ? "Joining..." : "Join this event"}
                </Button>
              )}
              {host && !isHost && (
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl"
                  onClick={() => navigate(`/app/messages/${host.id}`)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Message host
                </Button>
              )}
              {platform && event.bookingUrl && (
                <Button
                  variant="outline"
                  className={`gap-2 rounded-xl ${platform.color}`}
                  onClick={() => window.open(event.bookingUrl!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  {platform.label}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast({ title: "Link copied!" });
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Host */}
        {host && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Hosted by</h2>
            <div
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer prof-card"
              onClick={() => navigate(`/app/profile/${host.id}`)}
            >
              <img
                src={host.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${host.name}`}
                className="w-12 h-12 rounded-full border border-border bg-secondary object-cover"
                alt={host.name}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{host.name}</p>
                <p className="text-xs text-muted-foreground">{host.title} · {host.company}</p>
                <p className="text-xs text-muted-foreground">{host.industry}</p>
              </div>
              <Badge variant="secondary" className="text-xs">Host</Badge>
            </div>
          </div>
        )}

        {/* Attendees */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Who's coming · {event.currentGuests}/{event.maxGuests}
          </h2>
          <div className="space-y-2">
            {loadingAttendees
              ? Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              : attendees.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/25 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/profile/${a.id}`)}
                  >
                    <img
                      src={a.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${a.name}`}
                      className="w-9 h-9 rounded-full border border-border bg-secondary object-cover"
                      alt={a.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.title} · {a.company}</p>
                    </div>
                  </div>
                ))
            }

            {/* Open spots */}
            {spotsLeft > 0 && Array.from({ length: Math.min(spotsLeft, 3) }, (_, i) => (
              <div key={`open-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <span className="text-sm text-muted-foreground">Open seat</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload tickets section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tickets & Reservations</h2>
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Upload className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Upload your reservation or tickets</p>
            <p className="text-xs text-muted-foreground mb-3">PDF, image, or screenshot • Max 10MB</p>
            <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
