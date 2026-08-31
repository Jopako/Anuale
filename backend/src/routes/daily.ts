import type { FastifyInstance } from "fastify";

import { eq } from "drizzle-orm";

import { db } from "../db/index.js";

import {
  questions,
  clues,
  dailyChallenges,
} from "../db/schema.js";

export async function dailyRoutes(app: FastifyInstance) {
  app.get("/api/daily", async () => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
    }).format(new Date());

    const dailyChallenge = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, today))
      .limit(1);

    if (dailyChallenge.length === 0) {
      return {
        error: "Nenhum desafio encontrado para hoje.",
      };
    }

    const challenge = dailyChallenge[0];

    const questionResult = await db
      .select()
      .from(questions)
      .where(eq(questions.id, challenge.questionId))
      .limit(1);

    if (questionResult.length === 0) {
      return {
        error: "Pergunta não encontrada.",
      };
    }

    const question = questionResult[0];

    const cluesResult = await db
      .select()
      .from(clues)
      .where(eq(clues.questionId, question.id));

    return {
      id: question.id,
      year: question.year,
      clues: cluesResult
        .sort((a, b) => a.position - b.position)
        .map((clue) => clue.text),
    };
  });
}