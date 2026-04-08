import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  school: text("school"),
  bio: text("bio"),
  avatar: text("avatar"),
  linkedinUrl: text("linkedin_url"),
  currentCity: text("current_city").notNull().default("New York, NY"),
  lat: real("lat"),
  lng: real("lng"),
  isCurrentUser: integer("is_current_user", { mode: "boolean" }).default(false),
  yearsExperience: integer("years_experience"),
  skills: text("skills"), // JSON array
  workHistory: text("work_history"), // JSON array
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Events / Reservations
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(), // dinner, drinks, coffee, lunch, sports, travel, other
  maxGuests: integer("max_guests").default(4),
  currentGuests: integer("current_guests").default(1),
  description: text("description"),
  bookingPlatform: text("booking_platform"), // resy, opentable, sevenrooms, eventbrite, etc.
  bookingUrl: text("booking_url"),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  lat: real("lat"),
  lng: real("lng"),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true, currentGuests: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event Attendees
export const eventAttendees = sqliteTable("event_attendees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, declined
});

export type EventAttendee = typeof eventAttendees.$inferSelect;

// Messages
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  eventId: integer("event_id"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, isRead: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Connections
export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  connectedId: integer("connected_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted
});

export type Connection = typeof connections.$inferSelect;
