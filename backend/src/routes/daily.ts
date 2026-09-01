import type { FastifyInstance } from "fastify";

import { eq } from "drizzle-orm";

import { db } from "../db/index.js";

import {
  questions,
  clues,
  dailyChallenges,
} from "../db/schema.js";

export async function dailyRoutes(app: FastifyInstance) {
  // ========================================
  // DESAFIO DO DIA
  // ========================================

  app.get(
    "/api/daily",
    {
      schema: {
        tags: ["Daily"],

        summary: "Obtém o desafio do dia",

        description:
          "Retorna a pergunta, o ano e as dicas correspondentes ao desafio do dia.",

        response: {
          200: {
            description: "Desafio encontrado",

            type: "object",

            properties: {
              id: {
                type: "integer",
              },

              year: {
                type: "string",
              },

              clues: {
                type: "array",

                items: {
                  type: "string",
                },
              },
            },
          },

          404: {
            description:
              "Nenhum desafio encontrado para hoje",

            type: "object",

            properties: {
              error: {
                type: "string",
              },
            },
          },
        },
      },
    },

    async (_request, reply) => {
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
      }).format(new Date());

      const dailyChallenge = await db
        .select()
        .from(dailyChallenges)
        .where(
          eq(
            dailyChallenges.date,
            today
          )
        )
        .limit(1);

      if (dailyChallenge.length === 0) {
        return reply.code(404).send({
          error:
            "Nenhum desafio encontrado para hoje.",
        });
      }

      const challenge = dailyChallenge[0];

      const questionResult = await db
        .select()
        .from(questions)
        .where(
          eq(
            questions.id,
            challenge.questionId
          )
        )
        .limit(1);

      if (questionResult.length === 0) {
        return reply.code(404).send({
          error:
            "Pergunta não encontrada.",
        });
      }

      const question = questionResult[0];

      const cluesResult = await db
        .select()
        .from(clues)
        .where(
          eq(
            clues.questionId,
            question.id
          )
        );

      return {
        id: question.id,

        year: question.year,

        clues: cluesResult
          .sort(
            (a, b) =>
              a.position - b.position
          )
          .map(
            (clue) => clue.text
          ),
      };
    }
  );

  // ========================================
  // PERGUNTA PELO ID
  // ========================================

  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/:id",

    {
      schema: {
        tags: ["Questions"],

        summary:
          "Obtém uma pergunta pelo ID",

        description:
          "Retorna uma pergunta específica e suas dicas usando o ID da pergunta.",

        params: {
          type: "object",

          properties: {
            id: {
              type: "integer",

              description:
                "ID da pergunta",
            },
          },

          required: ["id"],
        },

        response: {
          200: {
            description:
              "Pergunta encontrada",

            type: "object",

            properties: {
              id: {
                type: "integer",
              },

              year: {
                type: "string",
              },

              clues: {
                type: "array",

                items: {
                  type: "string",
                },
              },
            },
          },

          400: {
            description:
              "ID inválido",

            type: "object",

            properties: {
              error: {
                type: "string",
              },
            },
          },

          404: {
            description:
              "Pergunta não encontrada",

            type: "object",

            properties: {
              error: {
                type: "string",
              },
            },
          },
        },
      },
    },

    async (request, reply) => {
      const id = Number(
        request.params.id
      );

      if (!Number.isInteger(id)) {
        return reply.code(400).send({
          error: "ID inválido.",
        });
      }

      const questionResult = await db
        .select()
        .from(questions)
        .where(
          eq(
            questions.id,
            id
          )
        )
        .limit(1);

      if (questionResult.length === 0) {
        return reply.code(404).send({
          error:
            "Pergunta não encontrada.",
        });
      }

      const question = questionResult[0];

      const cluesResult = await db
        .select()
        .from(clues)
        .where(
          eq(
            clues.questionId,
            question.id
          )
        );

      return {
        id: question.id,

        year: question.year,

        clues: cluesResult
          .sort(
            (a, b) =>
              a.position - b.position
          )
          .map(
            (clue) => clue.text
          ),
      };
    }
  );
}