import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export function registerRoutes(httpServer: Server, app: Express) {
  // Health check (Railway)
  app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

  // Current user
  app.get("/api/me", (req, res) => {
    const user = storage.getCurrentUser();
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  });

  app.patch("/api/me/city", (req, res) => {
    const user = storage.getCurrentUser();
    if (!user) return res.status(404).json({ error: "Not found" });
    const { city, lat, lng } = req.body;
    const updated = storage.updateUserCity(user.id, city, lat, lng);
    res.json(updated);
  });

  // Users
  app.get("/api/users", (req, res) => {
    const { city } = req.query;
    if (city) {
      res.json(storage.getUsersByCity(city as string));
    } else {
      res.json(storage.getAllUsers());
    }
  });

  app.get("/api/users/:id", (req, res) => {
    const user = storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  });

  // Events
  app.get("/api/events", (req, res) => {
    const { city } = req.query;
    if (city) {
      res.json(storage.getEventsByCity(city as string));
    } else {
      res.json(storage.getEventsByCity("Miami, FL"));
    }
  });

  app.get("/api/events/:id", (req, res) => {
    const event = storage.getEvent(Number(req.params.id));
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json(event);
  });

  app.post("/api/events", (req, res) => {
    try {
      const event = storage.createEvent(req.body);
      res.json(event);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/events/:id/join", (req, res) => {
    const me = storage.getCurrentUser();
    if (!me) return res.status(401).json({ error: "Unauthorized" });
    const attendee = storage.joinEvent(Number(req.params.id), me.id);
    res.json(attendee);
  });

  app.get("/api/events/:id/attendees", (req, res) => {
    const attendeeIds = storage.getEventAttendees(Number(req.params.id));
    const attendees = attendeeIds.map(id => storage.getUser(id)).filter(Boolean);
    res.json(attendees);
  });

  // Messages
  app.get("/api/messages/conversations", (req, res) => {
    const me = storage.getCurrentUser();
    if (!me) return res.status(401).json({ error: "Unauthorized" });
    const convs = storage.getConversations(me.id);
    const result = convs.map(({ userId, lastMessage }) => ({
      user: storage.getUser(userId),
      lastMessage,
    })).filter(c => c.user);
    res.json(result);
  });

  app.get("/api/messages/:userId", (req, res) => {
    const me = storage.getCurrentUser();
    if (!me) return res.status(401).json({ error: "Unauthorized" });
    const msgs = storage.getConversation(me.id, Number(req.params.userId));
    storage.markRead(Number(req.params.userId), me.id);
    res.json(msgs);
  });

  app.post("/api/messages", (req, res) => {
    const me = storage.getCurrentUser();
    if (!me) return res.status(401).json({ error: "Unauthorized" });
    const { toId, content, eventId } = req.body;
    const msg = storage.sendMessage({
      fromId: me.id,
      toId: Number(toId),
      content,
      eventId: eventId || null,
      createdAt: new Date().toISOString(),
    });
    res.json(msg);
  });

  // Connections
  app.post("/api/connections", (req, res) => {
    const me = storage.getCurrentUser();
    if (!me) return res.status(401).json({ error: "Unauthorized" });
    const { connectedId } = req.body;
    const conn = storage.connect(me.id, Number(connectedId));
    res.json(conn);
  });
}
