import {
  pgTable,
  integer,
  text,
  date,
} from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  year: text("year").notNull(),
});

export const clues = pgTable("clues", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  position: integer("position").notNull(),
  text: text("text").notNull(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  date: date("date").notNull().unique(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
});