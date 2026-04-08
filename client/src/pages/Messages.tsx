import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Message } from "@shared/schema";

interface Props {
  selectedUserId?: number;
}

export default function Messages({ selectedUserId: initialId }: Props) {
  const [, navigate] = useLocation();
  const [selectedId, setSelectedId] = useState<number | undefined>(initialId);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: me } = useQuery<User>({ queryKey: ["/api/me"] });
  const { data: conversations = [], isLoading: loadingConvs } = useQuery<{ user: User; lastMessage: Message }[]>({
    queryKey: ["/api/messages/conversations"],
    refetchInterval: 8000,
  });

  const { data: thread = [], isLoading: loadingThread } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedId],
    queryFn: () => fetch(`/api/messages/${selectedId}`).then(r => r.json()),
    enabled: !!selectedId,
    refetchInterval: 6000,
  });

  const selectedUser = conversations.find(c => c.user.id === selectedId)?.user;

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/messages", { toId: selectedId, content }),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  useEffect(() => {
    if (initialId) setSelectedId(initialId);
  }, [initialId]);

  const handleSend = () => {
    if (!draft.trim() || !selectedId) return;
    sendMutation.mutate(draft.trim());
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list */}
      <div className={`${selectedId ? "hidden md:flex" : "flex"} w-72 flex-shrink-0 flex-col border-r border-border`}>
        <div className="px-4 py-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Messages
          </h1>
          {conversations.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))
            : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Message someone from Discover</p>
                </div>
              )
            : conversations.map(({ user, lastMessage }) => {
                const unread = !lastMessage.isRead && lastMessage.toId === me?.id;
                return (
                  <button
                    key={user.id}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-border text-left hover:bg-secondary/50 transition-colors ${
                      selectedId === user.id ? "bg-secondary" : ""
                    }`}
                    onClick={() => setSelectedId(user.id)}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                        className="w-10 h-10 rounded-full border border-border bg-secondary object-cover"
                        alt={user.name}
                      />
                      {unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm leading-tight ${unread ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                          {user.name}
                        </p>
                        <span className="text-[11px] text-muted-foreground">{formatTime(lastMessage.createdAt)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${unread ? "text-foreground" : "text-muted-foreground"}`}>
                        {lastMessage.fromId === me?.id ? "You: " : ""}{lastMessage.content}
                      </p>
                    </div>
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* Chat panel */}
      {selectedId && selectedUser ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border flex-shrink-0">
            <button
              className="md:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mr-1"
              onClick={() => setSelectedId(undefined)}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img
              src={selectedUser.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedUser.name}`}
              className="w-9 h-9 rounded-full border border-border bg-secondary object-cover cursor-pointer"
              alt={selectedUser.name}
              onClick={() => navigate(`/app/profile/${selectedUser.id}`)}
            />
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/app/profile/${selectedUser.id}`)}>
              <p className="font-semibold text-foreground text-sm leading-tight">{selectedUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedUser.title} · {selectedUser.company}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loadingThread
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                  </div>
                ))
              : thread.map((msg, i) => {
                  const isMine = msg.fromId === me?.id;
                  const showTime = i === 0 || (new Date(thread[i].createdAt).getTime() - new Date(thread[i - 1].createdAt).getTime()) > 300000;
                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <div className="text-center text-[11px] text-muted-foreground my-3">
                          {formatTime(msg.createdAt)}
                        </div>
                      )}
                      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`msg-bubble ${isMine ? "sent" : "received"}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message ${selectedUser.name.split(" ")[0]}...`}
                className="flex-1 rounded-xl text-sm"
              />
              <Button
                size="icon"
                className="rounded-xl flex-shrink-0"
                onClick={handleSend}
                disabled={!draft.trim() || sendMutation.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Select a conversation
          </p>
          <p className="text-sm text-muted-foreground">
            Choose someone from the list, or discover professionals to message
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-xl gap-2 text-sm"
            onClick={() => navigate("/app/discover")}
          >
            Go to Discover
          </Button>
        </div>
      )}
    </div>
  );
}
