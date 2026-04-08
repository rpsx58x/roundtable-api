import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import {
  ArrowLeft, Building, GraduationCap, MapPin, Briefcase, MessageCircle,
  UserPlus, Calendar, ExternalLink, Award
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { User, Event } from "@shared/schema";

export default function Profile({ userId }: { userId?: number }) {
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const { toast } = useToast();

  const targetId = userId || (params.id ? Number(params.id) : undefined);

  const { data: me } = useQuery<User>({ queryKey: ["/api/me"] });
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users", targetId ?? "me"],
    queryFn: () => targetId
      ? fetch(`/api/users/${targetId}`).then(r => r.json())
      : fetch("/api/me").then(r => r.json()),
  });

  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: () => fetch(`/api/events`).then(r => r.json()),
  });

  const connectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/connections", { connectedId: user?.id }),
    onSuccess: () => toast({ title: "Connection request sent!" }),
  });

  const isOwnProfile = !targetId || targetId === me?.id;
  const userEvents = allEvents.filter(e => e.hostId === user?.id);

  const skills: string[] = user?.skills ? JSON.parse(user.skills) : [];
  const workHistory: { company: string; title: string; years: string; description?: string }[] = user?.workHistory ? JSON.parse(user.workHistory) : [];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="flex items-center justify-center h-full text-muted-foreground">User not found</div>;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full p-6 space-y-6 pb-12">
        {/* Back (when viewing others) */}
        {!isOwnProfile && (
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate(-1 as any)}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {/* Profile header */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Cover gradient */}
          <div className="h-20 bg-gradient-to-r from-primary/30 via-primary/15 to-transparent" />

          <div className="px-6 pb-6 -mt-8">
            <div className="flex items-end justify-between gap-4 mb-4">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                className="w-20 h-20 rounded-full border-4 border-card bg-secondary object-cover shadow-md"
                alt={user.name}
              />
              {isOwnProfile ? (
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs mb-1">
                  Edit profile
                </Button>
              ) : (
                <div className="flex gap-2 mb-1">
                  <Button
                    size="sm"
                    className="rounded-xl gap-1.5 text-xs"
                    onClick={() => navigate(`/app/messages/${user.id}`)}
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1.5 text-xs"
                    onClick={() => connectMutation.mutate()}
                    disabled={connectMutation.isPending}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Connect
                  </Button>
                </div>
              )}
            </div>

            {/* Name & title */}
            <div className="space-y-1 mb-4">
              <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {user.name}
                {isOwnProfile && (
                  <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">You</span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">{user.title}</p>
            </div>

            {/* Details grid */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Building className="w-4 h-4 flex-shrink-0" />
                <span>{user.company}</span>
                {user.industry && <Badge variant="secondary" className="text-xs">{user.industry}</Badge>}
              </div>
              {user.school && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                  <span>{user.school}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{user.currentCity}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active now</span>
              </div>
              {user.yearsExperience && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <span>{user.yearsExperience} years of experience</span>
                </div>
              )}
              {user.linkedinUrl && (
                <div className="flex items-center gap-2.5 text-sm">
                  <FaLinkedin className="w-4 h-4 flex-shrink-0 text-[#0A66C2]" />
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:underline flex items-center gap-1"
                  >
                    LinkedIn profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work history */}
        {workHistory.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Experience
            </h2>
            <div className="space-y-0">
              {workHistory.map((job, i) => (
                <div key={i} className="relative pl-5 pb-5">
                  {/* Timeline line */}
                  {i < workHistory.length - 1 && (
                    <div className="absolute left-1.5 top-3 bottom-0 w-px bg-border" />
                  )}
                  {/* Dot */}
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-primary bg-card" />

                  <div className="ml-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{job.years}</span>
                    </div>
                    {job.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{job.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {userEvents.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Upcoming Events
            </h2>
            <div className="space-y-2">
              {userEvents.map((ev) => {
                const spotsLeft = (ev.maxGuests ?? 4) - (ev.currentGuests ?? 1);
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/events/${ev.id}`)}
                  >
                    <span className="text-xl">{ev.type === "dinner" ? "🍽️" : ev.type === "drinks" ? "🍸" : ev.type === "coffee" ? "☕" : ev.type === "sports" ? "🏀" : "📍"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{ev.venue}</p>
                      <p className="text-xs text-muted-foreground">{ev.time} · {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Host</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
