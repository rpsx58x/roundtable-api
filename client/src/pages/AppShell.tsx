import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Map, Calendar, MessageCircle, User, Plus, Sun, Moon, LogOut,
  Bell, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoundTableLogo } from "@/components/RoundTableLogo";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

// Page imports
import Discover from "./Discover";
import Events from "./Events";
import EventDetail from "./EventDetail";
import Messages from "./Messages";
import Profile from "./Profile";
import CreateEvent from "./CreateEvent";

type Page = "discover" | "events" | "messages" | "profile" | "create";

const NAV_ITEMS: { id: Page; icon: typeof Map; label: string }[] = [
  { id: "discover", icon: Map, label: "Discover" },
  { id: "events", icon: Calendar, label: "Events" },
  { id: "messages", icon: MessageCircle, label: "Messages" },
  { id: "profile", icon: User, label: "Profile" },
];

export default function AppShell() {
  const [, navigate] = useLocation();
  const params = useParams<{ page?: string; id?: string }>();
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const currentPage = (params.page as Page) || "discover";
  const subId = params.id;

  const { data: me } = useQuery<UserType>({
    queryKey: ["/api/me"],
  });

  const { data: conversations } = useQuery<any[]>({
    queryKey: ["/api/messages/conversations"],
    refetchInterval: 15000,
  });

  const unreadCount = conversations?.filter(c => !c.lastMessage.isRead && c.lastMessage.toId === me?.id).length ?? 0;

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const goTo = (page: Page) => navigate(`/app/${page}`);

  const renderPage = () => {
    if (currentPage === "events" && subId) return <EventDetail eventId={Number(subId)} />;
    if (currentPage === "messages" && subId) return <Messages selectedUserId={Number(subId)} />;
    switch (currentPage) {
      case "events":    return <Events />;
      case "messages":  return <Messages />;
      case "profile":   return <Profile />;
      case "create":    return <CreateEvent />;
      default:          return <Discover />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-sidebar-border">
          <RoundTableLogo size="default" />
        </div>

        {/* City badge */}
        {me && (
          <div className="px-4 pt-4">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">{me.currentCity}</span>
              <ChevronDown className="w-3 h-3 group-hover:text-foreground" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`nav-item w-full text-left ${currentPage === id ? "active" : ""}`}
              onClick={() => goTo(id)}
              data-testid={`nav-${id}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {id === "messages" && unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] justify-center rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}

          {/* Create Event */}
          <div className="pt-3">
            <button
              className="nav-item w-full text-left border border-dashed border-primary/40 hover:border-primary/70 hover:bg-primary/8 text-primary hover:text-primary"
              onClick={() => goTo("create")}
              data-testid="nav-create"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">Create Event</span>
            </button>
          </div>
        </nav>

        {/* Bottom: user + theme */}
        <div className="px-3 pb-4 border-t border-sidebar-border pt-3 space-y-1">
          <button
            className="nav-item w-full text-left"
            onClick={toggleTheme}
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 flex-shrink-0" />
              : <Moon className="w-4 h-4 flex-shrink-0" />
            }
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>

          {me && (
            <button
              className="nav-item w-full text-left"
              onClick={() => goTo("profile")}
            >
              <img
                src={me.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${me.name}`}
                className="w-5 h-5 rounded-full bg-secondary object-cover flex-shrink-0"
                alt={me.name}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{me.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{me.title}</p>
              </div>
            </button>
          )}

          <button
            className="nav-item w-full text-left text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {renderPage()}
      </main>
    </div>
  );
}
