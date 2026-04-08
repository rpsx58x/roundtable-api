import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, or, ne } from "drizzle-orm";
import {
  users, events, eventAttendees, messages, connections,
  type User, type InsertUser,
  type Event, type InsertEvent,
  type EventAttendee,
  type Message, type InsertMessage,
  type Connection,
} from "@shared/schema";

// DATABASE_PATH env var lets Railway volume-mount persist the DB across deploys.
// Defaults to local file for dev.
const dbPath = process.env.DATABASE_PATH ?? "roundtable.db";
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    industry TEXT NOT NULL,
    school TEXT,
    bio TEXT,
    avatar TEXT,
    linkedin_url TEXT,
    current_city TEXT NOT NULL DEFAULT 'New York, NY',
    lat REAL,
    lng REAL,
    is_current_user INTEGER DEFAULT 0,
    years_experience INTEGER,
    skills TEXT,
    work_history TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    venue TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    max_guests INTEGER DEFAULT 4,
    current_guests INTEGER DEFAULT 1,
    description TEXT,
    booking_platform TEXT,
    booking_url TEXT,
    is_public INTEGER DEFAULT 1,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS event_attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER NOT NULL,
    to_id INTEGER NOT NULL,
    event_id INTEGER,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    connected_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  );
`);

export interface IStorage {
  // Users
  getUser(id: number): User | undefined;
  getCurrentUser(): User | undefined;
  getUserByEmail(email: string): User | undefined;
  getAllUsers(): User[];
  getUsersByCity(city: string): User[];
  createUser(data: InsertUser): User;
  updateUserCity(id: number, city: string, lat?: number, lng?: number): User | undefined;

  // Events
  getEvent(id: number): Event | undefined;
  getEventsByCity(city: string): Event[];
  getEventsByHost(hostId: number): Event[];
  createEvent(data: InsertEvent): Event;
  joinEvent(eventId: number, userId: number): EventAttendee;
  getEventAttendees(eventId: number): number[];

  // Messages
  getConversation(userId1: number, userId2: number): Message[];
  getConversations(userId: number): { userId: number; lastMessage: Message }[];
  sendMessage(data: InsertMessage): Message;
  markRead(fromId: number, toId: number): void;

  // Connections
  getConnections(userId: number): number[];
  connect(userId: number, connectedId: number): Connection;
}

function seedData() {
  const existing = db.select().from(users).all();
  if (existing.length > 0) return;

  // Seed current user (Rich - the person who is traveling to Miami)
  db.insert(users).values({
    name: "Rich Schilling",
    email: "rich@schilltech.com",
    title: "VP of Operations",
    company: "SchillTech",
    industry: "Technology",
    school: "Georgetown University",
    bio: "Operations leader with a passion for real estate tech and building meaningful professional connections. Currently in Miami for a business trip.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=rich&backgroundColor=b6e3f4",
    linkedinUrl: "https://linkedin.com/in/richschilling",
    currentCity: "Miami, FL",
    lat: 25.7617,
    lng: -80.1918,
    isCurrentUser: true,
    yearsExperience: 12,
    skills: JSON.stringify(["Operations", "Real Estate Tech", "Strategy", "Business Development", "P&L Management"]),
    workHistory: JSON.stringify([
      { company: "SchillTech", title: "VP of Operations", years: "2021 – Present", description: "Leading operations for a real estate technology platform." },
      { company: "JLL", title: "Director of Operations", years: "2018 – 2021", description: "Managed national operations for commercial real estate services." },
      { company: "CBRE", title: "Senior Manager", years: "2014 – 2018", description: "Oversaw regional property management and client relations." },
    ]),
  }).run();

  // Miami professionals
  db.insert(users).values({
    name: "Alexandra Chen",
    email: "alex.chen@nvpartners.com",
    title: "Managing Director",
    company: "NV Partners",
    industry: "Real Estate",
    school: "Wharton School of Business",
    bio: "Real estate investment professional focused on luxury residential and mixed-use development across South Florida. Always open to connecting with fellow industry professionals.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=alexandra&backgroundColor=ffd5dc",
    linkedinUrl: "https://linkedin.com/in/alexchen",
    currentCity: "Miami, FL",
    lat: 25.7749,
    lng: -80.1977,
    isCurrentUser: false,
    yearsExperience: 14,
    skills: JSON.stringify(["Real Estate Investment", "Development", "Capital Markets", "Luxury Residential", "Deal Structuring"]),
    workHistory: JSON.stringify([
      { company: "NV Partners", title: "Managing Director", years: "2019 – Present", description: "Leading South Florida real estate investment strategy." },
      { company: "Related Group", title: "VP Acquisitions", years: "2015 – 2019", description: "Sourced and closed $400M+ in luxury condo development deals." },
      { company: "Cushman & Wakefield", title: "Associate", years: "2010 – 2015", description: "Commercial investment sales across Miami-Dade and Broward." },
    ]),
  }).run();

  db.insert(users).values({
    name: "Jordan Torres",
    email: "jordan@apexcap.io",
    title: "Principal",
    company: "Apex Capital",
    industry: "Finance",
    school: "University of Miami",
    bio: "Private equity and real estate debt financing. Miami native. Always up for a good meal and making new connections.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=jordan&backgroundColor=c0aede",
    linkedinUrl: "https://linkedin.com/in/jordantorres",
    currentCity: "Miami, FL",
    lat: 25.7825,
    lng: -80.1340,
    isCurrentUser: false,
    yearsExperience: 9,
    skills: JSON.stringify(["Private Equity", "Real Estate Debt", "Structured Finance", "Portfolio Management", "Due Diligence"]),
    workHistory: JSON.stringify([
      { company: "Apex Capital", title: "Principal", years: "2020 – Present", description: "Real estate debt and equity investments across the Southeast." },
      { company: "Starwood Capital", title: "Associate", years: "2017 – 2020", description: "Acquisitions and asset management for hospitality and multifamily." },
      { company: "Goldman Sachs", title: "Analyst", years: "2015 – 2017", description: "Real estate investment banking, M&A advisory." },
    ]),
  }).run();

  db.insert(users).values({
    name: "Sarah Mitchell",
    email: "sarah@mirealty.com",
    title: "CEO",
    company: "MI Realty Group",
    industry: "Real Estate",
    school: "Florida International University",
    bio: "Built Miami's fastest growing boutique real estate brokerage from the ground up. Passionate about luxury properties and helping clients find their perfect home in South Florida.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=d1d4f9",
    linkedinUrl: "https://linkedin.com/in/sarahmitchell",
    currentCity: "Miami, FL",
    lat: 25.7680,
    lng: -80.1300,
    isCurrentUser: false,
    yearsExperience: 16,
    skills: JSON.stringify(["Luxury Real Estate", "Brokerage", "Business Development", "Negotiation", "Market Analysis"]),
    workHistory: JSON.stringify([
      { company: "MI Realty Group", title: "CEO & Founder", years: "2016 – Present", description: "Founded and scaled a luxury real estate brokerage to 80+ agents." },
      { company: "Douglas Elliman", title: "Top Producer", years: "2010 – 2016", description: "Consistently ranked #1 agent in Miami Beach sales volume." },
      { company: "Coldwell Banker", title: "Agent", years: "2008 – 2010", description: "Residential sales in Coconut Grove and Coral Gables." },
    ]),
  }).run();

  db.insert(users).values({
    name: "Marcus Webb",
    email: "marcus@southpointdev.com",
    title: "Co-Founder & COO",
    company: "South Point Development",
    industry: "Real Estate",
    school: "Duke University",
    bio: "Mixed-use development in emerging Miami neighborhoods. Traveler, golfer, and passionate about city planning.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=marcus&backgroundColor=b6e3f4",
    linkedinUrl: "https://linkedin.com/in/marcuswebb",
    currentCity: "Miami, FL",
    lat: 25.7910,
    lng: -80.2100,
    isCurrentUser: false,
    yearsExperience: 11,
    skills: JSON.stringify(["Mixed-Use Development", "Urban Planning", "Construction Management", "Zoning", "Investor Relations"]),
    workHistory: JSON.stringify([
      { company: "South Point Development", title: "Co-Founder & COO", years: "2018 – Present", description: "Developing $300M+ in Wynwood, Edgewater, and Little River projects." },
      { company: "Lennar Corporation", title: "VP Development", years: "2013 – 2018", description: "Led multifamily development pipeline across South Florida." },
      { company: "The Related Companies", title: "Project Manager", years: "2009 – 2013", description: "Managed luxury residential developments in Miami Beach." },
    ]),
  }).run();

  db.insert(users).values({
    name: "Priya Kapoor",
    email: "priya@miamiproptech.co",
    title: "Founder & CEO",
    company: "Proptech Miami",
    industry: "Technology",
    school: "MIT",
    bio: "Building the future of real estate through technology. Former engineer turned entrepreneur. Coffee obsessed.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=priya&backgroundColor=ffd5dc",
    linkedinUrl: "https://linkedin.com/in/priyakapoor",
    currentCity: "Miami, FL",
    lat: 25.7550,
    lng: -80.2200,
    isCurrentUser: false,
    yearsExperience: 8,
    skills: JSON.stringify(["Proptech", "AI/ML", "Product Development", "Real Estate Tech", "Fundraising"]),
    workHistory: JSON.stringify([
      { company: "Proptech Miami", title: "Founder & CEO", years: "2021 – Present", description: "Raised $12M Series A to build AI-driven property intelligence platform." },
      { company: "Zillow", title: "Senior Engineer", years: "2018 – 2021", description: "Led development of Zestimate 2.0 accuracy improvements." },
      { company: "Google", title: "Software Engineer", years: "2016 – 2018", description: "Maps and location intelligence products." },
    ]),
  }).run();

  // Seed events
  const allUsers = db.select().from(users).all();
  const alex = allUsers.find(u => u.name === "Alexandra Chen")!;
  const jordan = allUsers.find(u => u.name === "Jordan Torres")!;
  const sarah = allUsers.find(u => u.name === "Sarah Mitchell")!;
  const marcus = allUsers.find(u => u.name === "Marcus Webb")!;

  // The main event - Carbone dinner
  db.insert(events).values({
    hostId: alex.id,
    title: "Dinner at Carbone Miami",
    venue: "Carbone",
    address: "49 Collins Ave, Miami Beach, FL 33139",
    city: "Miami, FL",
    date: "2026-04-08",
    time: "8:00 PM",
    type: "dinner",
    maxGuests: 6,
    currentGuests: 3,
    description: "Joining for dinner at Carbone Miami tonight — spectacular Italian-American fare. Have a table for 6, 3 spots left. Would love to connect with other real estate and finance professionals in town. Reservation booked on Resy.",
    bookingPlatform: "resy",
    bookingUrl: "https://resy.com/cities/mia/carbone",
    isPublic: true,
    lat: 25.7750,
    lng: -80.1300,
  }).run();

  db.insert(events).values({
    hostId: jordan.id,
    title: "Drinks at Broken Shaker",
    venue: "Broken Shaker",
    address: "2727 Indian Creek Dr, Miami Beach, FL 33140",
    city: "Miami, FL",
    date: "2026-04-08",
    time: "9:30 PM",
    type: "drinks",
    maxGuests: 8,
    currentGuests: 2,
    description: "Post-work drinks at the Broken Shaker rooftop bar. Amazing cocktails and views. Open to anyone in finance or real estate — great spot to network and wind down.",
    bookingPlatform: "opentable",
    bookingUrl: "https://opentable.com",
    isPublic: true,
    lat: 25.7980,
    lng: -80.1350,
  }).run();

  db.insert(events).values({
    hostId: sarah.id,
    title: "Coffee & Real Estate Talk",
    venue: "Wynwood Coffee Co.",
    address: "2250 NW 2nd Ave, Miami, FL 33127",
    city: "Miami, FL",
    date: "2026-04-09",
    time: "9:00 AM",
    type: "coffee",
    maxGuests: 4,
    currentGuests: 2,
    description: "Morning coffee and informal real estate market discussion. Perfect for agents, brokers, and investors who want to talk South Florida market trends. Relaxed vibe.",
    bookingPlatform: null,
    bookingUrl: null,
    isPublic: true,
    lat: 25.8010,
    lng: -80.1990,
  }).run();

  db.insert(events).values({
    hostId: marcus.id,
    title: "Heat Game at Kaseya Center",
    venue: "Kaseya Center",
    address: "601 Biscayne Blvd, Miami, FL 33132",
    city: "Miami, FL",
    date: "2026-04-10",
    time: "7:30 PM",
    type: "sports",
    maxGuests: 4,
    currentGuests: 2,
    description: "Miami Heat playoff game! Have 2 extra floor-level tickets. Looking for sports fans and business folks to join. Great networking opportunity in a fun setting.",
    bookingPlatform: "ticketmaster",
    bookingUrl: "https://ticketmaster.com",
    isPublic: true,
    lat: 25.7814,
    lng: -80.1870,
  }).run();

  // Seed some messages
  const richUser = db.select().from(users).where(eq(users.isCurrentUser, true)).get();
  if (richUser && alex) {
    const now = new Date();
    const t1 = new Date(now.getTime() - 3600000).toISOString();
    const t2 = new Date(now.getTime() - 3400000).toISOString();
    const t3 = new Date(now.getTime() - 3200000).toISOString();

    db.insert(messages).values({
      fromId: alex.id, toId: richUser.id, content: "Hey Rich! Saw you're in Miami for work — we have a table at Carbone tonight at 8. Would love to have you join us!", createdAt: t1, isRead: false,
    }).run();
    db.insert(messages).values({
      fromId: richUser.id, toId: alex.id, content: "That sounds amazing! Carbone Miami is fantastic. Who else is coming?", createdAt: t2, isRead: true,
    }).run();
    db.insert(messages).values({
      fromId: alex.id, toId: richUser.id, content: "Jordan Torres from Apex Capital and one other. Very chill group. Table for 6, so plenty of room — bring someone if you'd like!", createdAt: t3, isRead: false,
    }).run();

    if (jordan) {
      const t4 = new Date(now.getTime() - 7200000).toISOString();
      db.insert(messages).values({
        fromId: jordan.id, toId: richUser.id, content: "Welcome to Miami, Rich! Heading to Broken Shaker after dinner if you want to keep the night going.", createdAt: t4, isRead: false,
      }).run();
    }
  }
}

seedData();

export const storage: IStorage = {
  getUser(id) {
    return db.select().from(users).where(eq(users.id, id)).get();
  },
  getCurrentUser() {
    return db.select().from(users).where(eq(users.isCurrentUser, true)).get();
  },
  getUserByEmail(email) {
    return db.select().from(users).where(eq(users.email, email)).get();
  },
  getAllUsers() {
    return db.select().from(users).all();
  },
  getUsersByCity(city) {
    return db.select().from(users).where(and(eq(users.currentCity, city), ne(users.isCurrentUser, true))).all();
  },
  createUser(data) {
    return db.insert(users).values(data).returning().get();
  },
  updateUserCity(id, city, lat, lng) {
    return db.update(users).set({ currentCity: city, lat, lng }).where(eq(users.id, id)).returning().get();
  },

  getEvent(id) {
    return db.select().from(events).where(eq(events.id, id)).get();
  },
  getEventsByCity(city) {
    return db.select().from(events).where(eq(events.city, city)).all();
  },
  getEventsByHost(hostId) {
    return db.select().from(events).where(eq(events.hostId, hostId)).all();
  },
  createEvent(data) {
    return db.insert(events).values({ ...data, currentGuests: 1 }).returning().get();
  },
  joinEvent(eventId, userId) {
    const attendee = db.insert(eventAttendees).values({ eventId, userId, status: "confirmed" }).returning().get();
    db.update(events).set({ currentGuests: db.select().from(eventAttendees).where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.status, "confirmed"))).all().length + 1 }).where(eq(events.id, eventId)).run();
    return attendee;
  },
  getEventAttendees(eventId) {
    return db.select().from(eventAttendees).where(eq(eventAttendees.eventId, eventId)).all().map(a => a.userId);
  },

  getConversation(userId1, userId2) {
    return db.select().from(messages).where(
      or(
        and(eq(messages.fromId, userId1), eq(messages.toId, userId2)),
        and(eq(messages.fromId, userId2), eq(messages.toId, userId1))
      )
    ).all().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  getConversations(userId) {
    const allMsgs = db.select().from(messages).where(
      or(eq(messages.fromId, userId), eq(messages.toId, userId))
    ).all();
    const convMap = new Map<number, Message>();
    for (const msg of allMsgs) {
      const otherId = msg.fromId === userId ? msg.toId : msg.fromId;
      const existing = convMap.get(otherId);
      if (!existing || msg.createdAt > existing.createdAt) {
        convMap.set(otherId, msg);
      }
    }
    return Array.from(convMap.entries()).map(([uid, lastMessage]) => ({ userId: uid, lastMessage }));
  },
  sendMessage(data) {
    return db.insert(messages).values(data).returning().get();
  },
  markRead(fromId, toId) {
    db.update(messages).set({ isRead: true }).where(and(eq(messages.fromId, fromId), eq(messages.toId, toId))).run();
  },

  getConnections(userId) {
    const conns = db.select().from(connections).where(
      or(eq(connections.userId, userId), eq(connections.connectedId, userId))
    ).all();
    return conns.map(c => c.userId === userId ? c.connectedId : c.userId);
  },
  connect(userId, connectedId) {
    return db.insert(connections).values({ userId, connectedId, status: "accepted" }).returning().get();
  },
};
