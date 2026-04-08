import { useState, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, MapPin, Filter, Briefcase, MessageCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Event } from "@shared/schema";

const MapView = lazy(() => import("@/components/MapView"));

const INDUSTRIES = ["All", "Real Estate", "Finance", "Technology", "Legal", "Healthcare", "Consulting"];

export default function Discover() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: me } = useQuery<User>({ queryKey: ["/api/me"] });
  const { data: professionals = [], isLoading: loadingPros } = useQuery<User[]>({
    queryKey: ["/api/users", { city: me?.currentCity }],
    queryFn: () => fetch(`/api/users?city=${encodeURIComponent(me?.currentCity || "Miami, FL")}`).then(r => r.json()),
    enabled: !!me,
  });
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events", { city: me?.currentCity }],
    queryFn: () => fetch(`/api/events?city=${encodeURIComponent(me?.currentCity || "Miami, FL")}`).then(r => r.json()),
    enabled: !!me,
  });

  const filtered = professionals.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industryFilter === "All" || p.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-border overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Discover
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {me?.currentCity || "Miami, FL"}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filtered.length} nearby
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, title..."
              className="pl-9 text-sm rounded-lg"
            />
          </div>

          {/* Industry filter */}
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="text-sm rounded-lg">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Professional list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingPros
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-3 rounded-xl border border-border">
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            : filtered.map((pro) => (
                <ProfCard
                  key={pro.id}
                  pro={pro}
                  isSelected={selectedUser?.id === pro.id}
                  onSelect={() => setSelectedUser(pro.id === selectedUser?.id ? null : pro)}
                  onMessage={() => navigate(`/app/messages/${pro.id}`)}
                />
              ))
          }
          {!loadingPros && filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No professionals match your filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Map panel */}
      <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
        {/* Map legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary border border-white shadow-sm inline-block" />
            Professionals
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive border border-white shadow-sm inline-block" />
            Events tonight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-yellow-400 shadow-sm inline-block" />
            You
          </span>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-border min-h-0">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-secondary rounded-xl">
              <div className="text-sm text-muted-foreground">Loading map...</div>
            </div>
          }>
            <MapView
              professionals={filtered}
              events={events}
              currentUser={me}
              onSelectUser={setSelectedUser}
              onSelectEvent={(ev) => navigate(`/app/events/${ev.id}`)}
            />
          </Suspense>
        </div>

        {/* Selected user card overlay */}
        {selectedUser && (
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 slide-left">
            <img
              src={selectedUser.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedUser.name}`}
              className="w-12 h-12 rounded-full border border-border bg-secondary object-cover"
              alt={selectedUser.name}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{selectedUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedUser.title} · {selectedUser.company}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.industry} · {selectedUser.yearsExperience}y exp</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate(`/app/messages/${selectedUser.id}`)}>
                <MessageCircle className="w-3.5 h-3.5" /> Message
              </Button>
              <Button size="sm" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate(`/app/profile/${selectedUser.id}`)}>
                <Briefcase className="w-3.5 h-3.5" /> View
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfCard({ pro, isSelected, onSelect, onMessage }: {
  pro: User;
  isSelected: boolean;
  onSelect: () => void;
  onMessage: () => void;
}) {
  const skills: string[] = pro.skills ? JSON.parse(pro.skills) : [];

  return (
    <div
      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer prof-card ${
        isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-border"
      }`}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <img
          src={pro.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${pro.name}`}
          className="w-10 h-10 rounded-full border border-border bg-secondary object-cover flex-shrink-0"
          alt={pro.name}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-foreground text-sm leading-tight">{pro.name}</p>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">{pro.yearsExperience}y</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{pro.title}</p>
          <p className="text-xs text-muted-foreground truncate">{pro.company}</p>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{s}</span>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full text-xs rounded-lg gap-1.5"
            onClick={(e) => { e.stopPropagation(); onMessage(); }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Message
          </Button>
        </div>
      )}
    </div>
  );
}
