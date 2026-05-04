import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  json,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["student", "superadmin"]).default("student").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const courses = mysqlTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 50 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
}));

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: bigint("courseId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isFree: boolean("isFree").default(false).notNull(),
  content: text("content"),
  demoSteps: json("demoSteps"),
  quiz: json("quiz"),
  exercises: json("exercises"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  courseSlugIdx: index("course_slug_idx").on(table.courseId, table.slug),
}));

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export const progress = mysqlTable("progress", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("courseId", { mode: "number", unsigned: true }).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  watchDuration: int("watchDuration").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userLessonIdx: index("user_lesson_idx").on(table.userId, table.lessonId),
  userCourseIdx: index("user_course_idx").on(table.userId, table.courseId),
}));

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = typeof progress.$inferInsert;

export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  merchantId: varchar("merchantId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const knowledgebase = mysqlTable("knowledgebase", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgebaseItem = typeof knowledgebase.$inferSelect;
export type InsertKnowledgebaseItem = typeof knowledgebase.$inferInsert;
