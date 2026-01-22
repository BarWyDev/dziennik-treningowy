import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, timestamp, text, boolean, uuid, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
});
const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
const trainingTypes = pgTable("training_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  isDefault: boolean("is_default").notNull().default(false),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const trainings = pgTable("trainings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  trainingTypeId: uuid("training_type_id").notNull().references(() => trainingTypes.id),
  date: date("date").notNull(),
  time: text("time"),
  // HH:MM format
  durationMinutes: integer("duration_minutes").notNull(),
  // Multi-category ratings (1-5 scale)
  ratingOverall: integer("rating_overall").notNull(),
  // Required
  ratingPhysical: integer("rating_physical"),
  // Optional
  ratingEnergy: integer("rating_energy"),
  // Optional
  ratingMotivation: integer("rating_motivation"),
  // Optional
  ratingDifficulty: integer("rating_difficulty"),
  // Optional
  // Reflection/Coaching fields
  trainingGoal: text("training_goal"),
  // Mój cel na trening
  mostSatisfiedWith: text("most_satisfied_with"),
  // Z czego jestem najbardziej zadowolony
  improveNextTime: text("improve_next_time"),
  // Co następnym razem chcę zrobić lepiej
  howToImprove: text("how_to_improve"),
  // Jak mogę to zrobić
  // Other fields
  notes: text("notes"),
  caloriesBurned: integer("calories_burned"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value").default(0),
  unit: text("unit"),
  deadline: date("deadline"),
  status: text("status").notNull().default("active"),
  isArchived: boolean("is_archived").notNull().default(false),
  achievedAt: timestamp("achieved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const personalRecords = pgTable("personal_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityName: text("activity_name").notNull(),
  result: text("result").notNull(),
  // Store as text to support decimals and flexible formatting
  unit: text("unit").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  trainings: many(trainings),
  trainingTypes: many(trainingTypes),
  goals: many(goals),
  personalRecords: many(personalRecords)
}));
const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));
const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));
const trainingTypesRelations = relations(trainingTypes, ({ one, many }) => ({
  user: one(users, {
    fields: [trainingTypes.userId],
    references: [users.id]
  }),
  trainings: many(trainings)
}));
const trainingsRelations = relations(trainings, ({ one }) => ({
  user: one(users, {
    fields: [trainings.userId],
    references: [users.id]
  }),
  trainingType: one(trainingTypes, {
    fields: [trainings.trainingTypeId],
    references: [trainingTypes.id]
  })
}));
const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id]
  })
}));
const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  user: one(users, {
    fields: [personalRecords.userId],
    references: [users.id]
  })
}));

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  accounts,
  accountsRelations,
  goals,
  goalsRelations,
  personalRecords,
  personalRecordsRelations,
  sessions,
  sessionsRelations,
  trainingTypes,
  trainingTypesRelations,
  trainings,
  trainingsRelations,
  users,
  usersRelations,
  verifications
}, Symbol.toStringTag, { value: 'Module' }));

const connectionString = "postgres://postgres:ufRW2nXNu6@mws03.mikr.us:52088/postgres";
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export { trainings as a, accounts as b, db as d, goals as g, personalRecords as p, sessions as s, trainingTypes as t, users as u, verifications as v };
