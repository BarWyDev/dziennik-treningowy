import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  date,
  uuid,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// Better Auth Tables
// ============================================

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
    expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
  })
);

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_accounts_user_id').on(table.userId),
  })
);

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// Application Tables
// ============================================

export const trainingTypes = pgTable(
  'training_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    isDefault: boolean('is_default').notNull().default(false),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_training_types_user_id').on(table.userId),
    isDefaultIdx: index('idx_training_types_is_default').on(table.isDefault),
  })
);

export const trainings = pgTable(
  'trainings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    trainingTypeId: uuid('training_type_id')
      .notNull()
      .references(() => trainingTypes.id),
    date: date('date').notNull(),
    time: text('time'), // HH:MM format
    durationMinutes: integer('duration_minutes').notNull(),
    description: text('description'),

    // Multi-category ratings (1-5 scale)
    ratingOverall: integer('rating_overall').notNull(), // Required
    ratingPhysical: integer('rating_physical'), // Optional
    ratingEnergy: integer('rating_energy'), // Optional
    ratingMotivation: integer('rating_motivation'), // Optional
    ratingDifficulty: integer('rating_difficulty'), // Optional

    // Reflection/Coaching fields
    trainingGoal: text('training_goal'), // Mój cel na trening
    mostSatisfiedWith: text('most_satisfied_with'), // Z czego jestem najbardziej zadowolony
    improveNextTime: text('improve_next_time'), // Co następnym razem chcę zrobić lepiej
    howToImprove: text('how_to_improve'), // Jak mogę to zrobić

    // Other fields
    notes: text('notes'),
    caloriesBurned: integer('calories_burned'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_trainings_user_id').on(table.userId),
    dateIdx: index('idx_trainings_date').on(table.date),
    userDateIdx: index('idx_trainings_user_date').on(table.userId, table.date),
  })
);

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    targetValue: integer('target_value'),
    currentValue: integer('current_value').default(0),
    unit: text('unit'),
    deadline: date('deadline'),
    status: text('status').notNull().default('active'),
    isArchived: boolean('is_archived').notNull().default(false),
    achievedAt: timestamp('achieved_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_goals_user_id').on(table.userId),
    statusIdx: index('idx_goals_status').on(table.status),
    userStatusArchivedIdx: index('idx_goals_user_status_archived').on(
      table.userId,
      table.status,
      table.isArchived
    ),
  })
);

export const personalRecords = pgTable(
  'personal_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activityName: text('activity_name').notNull(),
    result: text('result').notNull(), // Store as text to support decimals and flexible formatting
    unit: text('unit').notNull(),
    date: date('date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_personal_records_user_id').on(table.userId),
    dateIdx: index('idx_personal_records_date').on(table.date),
    userDateIdx: index('idx_personal_records_user_date').on(table.userId, table.date),
  })
);

export const userConsents = pgTable(
  'user_consents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    consentType: text('consent_type').notNull(), // 'terms_privacy', 'health_data'
    version: text('version').notNull(), // '1.0', '1.1' etc.
    grantedAt: timestamp('granted_at').notNull().defaultNow(),
    withdrawnAt: timestamp('withdrawn_at'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_consents_user_id').on(table.userId),
    consentTypeIdx: index('idx_user_consents_type').on(table.userId, table.consentType),
  })
);

export const mediaAttachments = pgTable(
  'media_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Polimorficzne relacje - attachment należy do jednego rodzica
    trainingId: uuid('training_id').references(() => trainings.id, { onDelete: 'cascade' }),
    personalRecordId: uuid('personal_record_id').references(() => personalRecords.id, {
      onDelete: 'cascade',
    }),

    // Metadane pliku
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: text('file_type').notNull(), // 'image' | 'video'
    mimeType: text('mime_type').notNull(),
    fileSize: integer('file_size').notNull(), // rozmiar w bajtach

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_media_attachments_user_id').on(table.userId),
    trainingIdIdx: index('idx_media_attachments_training_id').on(table.trainingId),
    personalRecordIdIdx: index('idx_media_attachments_personal_record_id').on(
      table.personalRecordId
    ),
  })
);

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  trainings: many(trainings),
  trainingTypes: many(trainingTypes),
  goals: many(goals),
  personalRecords: many(personalRecords),
  mediaAttachments: many(mediaAttachments),
  consents: many(userConsents),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const trainingTypesRelations = relations(trainingTypes, ({ one, many }) => ({
  user: one(users, {
    fields: [trainingTypes.userId],
    references: [users.id],
  }),
  trainings: many(trainings),
}));

export const trainingsRelations = relations(trainings, ({ one, many }) => ({
  user: one(users, {
    fields: [trainings.userId],
    references: [users.id],
  }),
  trainingType: one(trainingTypes, {
    fields: [trainings.trainingTypeId],
    references: [trainingTypes.id],
  }),
  mediaAttachments: many(mediaAttachments),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const personalRecordsRelations = relations(personalRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [personalRecords.userId],
    references: [users.id],
  }),
  mediaAttachments: many(mediaAttachments),
}));

export const userConsentsRelations = relations(userConsents, ({ one }) => ({
  user: one(users, {
    fields: [userConsents.userId],
    references: [users.id],
  }),
}));

export const mediaAttachmentsRelations = relations(mediaAttachments, ({ one }) => ({
  user: one(users, {
    fields: [mediaAttachments.userId],
    references: [users.id],
  }),
  training: one(trainings, {
    fields: [mediaAttachments.trainingId],
    references: [trainings.id],
  }),
  personalRecord: one(personalRecords, {
    fields: [mediaAttachments.personalRecordId],
    references: [personalRecords.id],
  }),
}));

// ============================================
// Types
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type TrainingType = typeof trainingTypes.$inferSelect;
export type NewTrainingType = typeof trainingTypes.$inferInsert;

export type Training = typeof trainings.$inferSelect;
export type NewTraining = typeof trainings.$inferInsert;

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type NewPersonalRecord = typeof personalRecords.$inferInsert;

export type MediaAttachment = typeof mediaAttachments.$inferSelect;
export type NewMediaAttachment = typeof mediaAttachments.$inferInsert;

export type UserConsent = typeof userConsents.$inferSelect;
export type NewUserConsent = typeof userConsents.$inferInsert;
