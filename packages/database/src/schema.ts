import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plan: text("plan").default("free"), // 'free', 'pro', 'enterprise'
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  organizationId: integer("organization_id").references(() => organizations.id),
  role: text("role").default("viewer"), // 'admin', 'viewer'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- BETTERAUTH TABLES ---

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  token: text("token").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- IOT DEVICES ---

export const scales = pgTable("scales", {
  id: uuid("id").defaultRandom().primaryKey(),
  macAddress: text("mac_address").unique().notNull(), // Unikalny identyfikator sprzętu
  name: text("name"),
  organizationId: integer("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- TIMESCALE HYPERTABLES ---

// 1. Pomiary Wagi (Eventy - ptak wchodzi na wagę)
export const weightMeasurements = pgTable(
  "weight_measurements",
  {
    time: timestamp("time").notNull(), // Kluczowe dla Timescale
    scaleId: uuid("scale_id")
      .references(() => scales.id)
      .notNull(),
    organizationId: integer("organization_id").notNull(), // Denormalizacja dla wydajności

    weight: doublePrecision("weight").notNull(),
    isValid: boolean("is_valid").default(true), // Flaga po analizie statystycznej
  },
  (table) => ({
    // Indeksy dla szybkiego wyszukiwania po czasie i urządzeniu
    idx: index("weight_time_idx").on(table.scaleId, table.time.desc()),
  }),
);

// 2. Środowisko (Ciągłe - co 5-15 sekund)
export const environmentMetrics = pgTable(
  "environment_metrics",
  {
    time: timestamp("time").notNull(),
    scaleId: uuid("scale_id")
      .references(() => scales.id)
      .notNull(),
    organizationId: integer("organization_id").notNull(),

    temperature: doublePrecision("temperature"),
    humidity: doublePrecision("humidity"),
  },
  (table) => ({
    idx: index("env_time_idx").on(table.scaleId, table.time.desc()),
  }),
);

// --- RELACJE (Drizzle Relations) ---
// To pomaga w pobieraniu danych typu: "Daj mi organizację z wszystkimi jej wagami"

export const organizationRelations = relations(organizations, ({ many }) => ({
  scales: many(scales),
  users: many(users),
}));

export const scalesRelations = relations(scales, ({ one }) => ({
  organization: one(organizations, {
    fields: [scales.organizationId],
    references: [organizations.id],
  }),
}));
