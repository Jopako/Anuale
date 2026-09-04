import type { FastifyInstance } from "fastify";

import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";

import {
  questions,
  clues,
  dailyChallenges,
} from "../db/schema.js";

import { adminAuth } from "../middlewares/adminAuth.js";

export async function adminRoutes(
  app: FastifyInstance
) {
  app.post<{
    Body: {
      username: string;
      password: string;
    };
  }>(
    "/api/admin/login",
    {
      schema: {
        tags: ["Admin"],
        summary: "Login do administrador",

        body: {
          type: "object",
          required: [
            "username",
            "password",
          ],
          properties: {
            username: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
        },

        response: {
          200: {
            type: "object",
            properties: {
              token: {
                type: "string",
              },
            },
          },

          401: {
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
      const {
        username,
        password,
      } = request.body;

      if (
        username !==
          process.env.ADMIN_USERNAME ||
        password !==
          process.env.ADMIN_PASSWORD
      ) {
        return reply.code(401).send({
          error:
            "Usuário ou senha inválidos.",
        });
      }

      const token = app.jwt.sign(
        {
          username,
          role: "admin",
        },
        {
          expiresIn: "8h",
        }
      );

      return {
        token,
      };
    }
  );

  app.get(
    "/api/admin/questions",
    {
      preHandler: adminAuth,

      schema: {
        tags: ["Admin"],
        summary:
          "Lista todas as perguntas",

        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },

    async (_request, reply) => {
      const questionRows =
        await db
          .select()
          .from(questions);

      const clueRows =
        await db
          .select()
          .from(clues);

      const dailyRows =
        await db
          .select()
          .from(dailyChallenges);

      const result =
        questionRows.map(
          (question) => {
            const daily =
              dailyRows.find(
                (challenge) =>
                  challenge.questionId ===
                  question.id
              );

            return {
              id: question.id,
              year: question.year,
              date: daily?.date ?? null,
              clues: clueRows
                .filter(
                  (clue) =>
                    clue.questionId ===
                    question.id
                )
                .sort(
                  (a, b) =>
                    a.position -
                    b.position
                )
                .map(
                  (clue) =>
                    clue.text
                ),
            };
          }
        );

      return reply.send(result);
    }
  );

  app.post<{
    Body: {
      year: string;
      date: string;
      clues: string[];
    };
  }>(
    "/api/admin/questions",
    {
      preHandler: adminAuth,

      schema: {
        tags: ["Admin"],
        summary:
          "Cria uma nova pergunta",

        security: [
          {
            bearerAuth: [],
          },
        ],

        body: {
          type: "object",
          required: [
            "year",
            "date",
            "clues",
          ],

          properties: {
            year: {
              type: "string",
              minLength: 4,
              maxLength: 4,
            },

            date: {
              type: "string",
              pattern:
                "^\\d{4}-\\d{2}-\\d{2}$",
            },

            clues: {
              type: "array",
              minItems: 4,
              maxItems: 4,

              items: {
                type: "string",
                minLength: 1,
              },
            },
          },
        },
      },
    },

    async (request, reply) => {
      const {
        year,
        date,
        clues: clueTexts,
      } = request.body;

      if (!/^\d{4}$/.test(year)) {
        return reply.code(400).send({
          error:
            "O ano deve conter exatamente 4 dígitos.",
        });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date
        )
      ) {
        return reply.code(400).send({
          error:
            "A data deve estar no formato YYYY-MM-DD.",
        });
      }

      if (clueTexts.length !== 4) {
        return reply.code(400).send({
          error:
            "A pergunta deve possuir exatamente 4 dicas.",
        });
      }

      if (
        clueTexts.some(
          (clue) => !clue.trim()
        )
      ) {
        return reply.code(400).send({
          error:
            "Todas as dicas devem ser preenchidas.",
        });
      }

      const existingQuestion =
        await db
          .select()
          .from(questions)
          .where(
            eq(
              questions.year,
              year
            )
          )
          .limit(1);

      if (
        existingQuestion.length > 0
      ) {
        return reply.code(409).send({
          error:
            "Já existe uma pergunta com esse ano.",
        });
      }

      const existingDate =
        await db
          .select()
          .from(dailyChallenges)
          .where(
            eq(
              dailyChallenges.date,
              date
            )
          )
          .limit(1);

      if (
        existingDate.length > 0
      ) {
        return reply.code(409).send({
          error:
            "Já existe um desafio cadastrado para essa data.",
        });
      }

      const result =
        await db.transaction(
          async (tx) => {
            const insertedQuestion =
              (
                await tx
                  .insert(questions)
                  .values({
                    year,
                  })
                  .returning()
              )[0];

            await tx
              .insert(clues)
              .values(
                clueTexts.map(
                  (
                    text,
                    index
                  ) => ({
                    questionId:
                      insertedQuestion.id,
                    position:
                      index + 1,
                    text:
                      text.trim(),
                  })
                )
              );

            await tx
              .insert(
                dailyChallenges
              )
              .values({
                date,
                questionId:
                  insertedQuestion.id,
              });

            return insertedQuestion;
          }
        );

      return reply
        .code(201)
        .send({
          message:
            "Pergunta criada com sucesso.",

          question: {
            id: result.id,
            year: result.year,
            date,
            clues:
              clueTexts.map(
                (clue) =>
                  clue.trim()
              ),
          },
        });
    }
  );

  app.put<{
    Params: {
      id: string;
    };

    Body: {
      year: string;
      date: string;
      clues: string[];
    };
  }>(
    "/api/admin/questions/:id",
    {
      preHandler: adminAuth,

      schema: {
        tags: ["Admin"],
        summary:
          "Edita uma pergunta",

        security: [
          {
            bearerAuth: [],
          },
        ],

        params: {
          type: "object",

          required: ["id"],

          properties: {
            id: {
              type: "string",
              pattern: "^\\d+$",
            },
          },
        },

        body: {
          type: "object",

          required: [
            "year",
            "date",
            "clues",
          ],

          properties: {
            year: {
              type: "string",
              minLength: 4,
              maxLength: 4,
            },

            date: {
              type: "string",
              pattern:
                "^\\d{4}-\\d{2}-\\d{2}$",
            },

            clues: {
              type: "array",
              minItems: 4,
              maxItems: 4,

              items: {
                type: "string",
                minLength: 1,
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
          error:
            "ID inválido.",
        });
      }

      const {
        year,
        date,
        clues: clueTexts,
      } = request.body;

      if (!/^\d{4}$/.test(year)) {
        return reply.code(400).send({
          error:
            "O ano deve conter exatamente 4 dígitos.",
        });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date
        )
      ) {
        return reply.code(400).send({
          error:
            "A data deve estar no formato YYYY-MM-DD.",
        });
      }

      if (clueTexts.length !== 4) {
        return reply.code(400).send({
          error:
            "A pergunta deve possuir exatamente 4 dicas.",
        });
      }

      if (
        clueTexts.some(
          (clue) => !clue.trim()
        )
      ) {
        return reply.code(400).send({
          error:
            "Todas as dicas devem ser preenchidas.",
        });
      }

      const existingQuestion =
        (
          await db
            .select()
            .from(questions)
            .where(
              eq(
                questions.id,
                id
              )
            )
            .limit(1)
        )[0];

      if (!existingQuestion) {
        return reply.code(404).send({
          error:
            "Pergunta não encontrada.",
        });
      }

      const questionWithSameYear =
        await db
          .select()
          .from(questions)
          .where(
            eq(
              questions.year,
              year
            )
          );

      const duplicateYear =
        questionWithSameYear.find(
          (question) =>
            question.id !== id
        );

      if (duplicateYear) {
        return reply.code(409).send({
          error:
            "Já existe outra pergunta com esse ano.",
        });
      }

      const existingDaily =
        await db
          .select()
          .from(
            dailyChallenges
          )
          .where(
            eq(
              dailyChallenges.date,
              date
            )
          );

      const duplicateDate =
        existingDaily.find(
          (challenge) =>
            challenge.questionId !==
            id
        );

      if (duplicateDate) {
        return reply.code(409).send({
          error:
            "Já existe outro desafio cadastrado para essa data.",
        });
      }

      const updated =
        await db.transaction(
          async (tx) => {
            const updatedQuestion =
              (
                await tx
                  .update(questions)
                  .set({
                    year,
                  })
                  .where(
                    eq(
                      questions.id,
                      id
                    )
                  )
                  .returning()
              )[0];

            const existingClues =
              await tx
                .select()
                .from(clues)
                .where(
                  eq(
                    clues.questionId,
                    id
                  )
                );

            for (
              let index = 0;
              index <
              clueTexts.length;
              index++
            ) {
              const position =
                index + 1;

              const text =
                clueTexts[
                  index
                ].trim();

              const existingClue =
                existingClues.find(
                  (clue) =>
                    clue.position ===
                    position
                );

              if (existingClue) {
                await tx
                  .update(clues)
                  .set({
                    text,
                  })
                  .where(
                    eq(
                      clues.id,
                      existingClue.id
                    )
                  );
              } else {
                await tx
                  .insert(clues)
                  .values({
                    questionId: id,
                    position,
                    text,
                  });
              }
            }

            const existingQuestionDaily =
              await tx
                .select()
                .from(
                  dailyChallenges
                )
                .where(
                  eq(
                    dailyChallenges.questionId,
                    id
                  )
                )
                .limit(1);

            if (
              existingQuestionDaily.length >
              0
            ) {
              await tx
                .update(
                  dailyChallenges
                )
                .set({
                  date,
                  questionId:
                    id,
                })
                .where(
                  eq(
                    dailyChallenges.id,
                    existingQuestionDaily[0]
                      .id
                  )
                );
            } else {
              await tx
                .insert(
                  dailyChallenges
                )
                .values({
                  date,
                  questionId:
                    id,
                });
            }

            return updatedQuestion;
          }
        );

      return reply.send({
        message:
          "Pergunta atualizada com sucesso.",

        question: {
          id: updated.id,
          year: updated.year,
          date,
          clues:
            clueTexts.map(
              (clue) =>
                clue.trim()
            ),
        },
      });
    }
  );

  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/api/admin/questions/:id",
    {
      preHandler: adminAuth,

      schema: {
        tags: ["Admin"],
        summary:
          "Exclui uma pergunta",

        security: [
          {
            bearerAuth: [],
          },
        ],

        params: {
          type: "object",

          required: ["id"],

          properties: {
            id: {
              type: "string",
              pattern: "^\\d+$",
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
          error:
            "ID inválido.",
        });
      }

      const existingQuestion =
        (
          await db
            .select()
            .from(questions)
            .where(
              eq(
                questions.id,
                id
              )
            )
            .limit(1)
        )[0];

      if (!existingQuestion) {
        return reply.code(404).send({
          error:
            "Pergunta não encontrada.",
        });
      }

      await db.transaction(
        async (tx) => {
          await tx
            .delete(clues)
            .where(
              eq(
                clues.questionId,
                id
              )
            );

          await tx
            .delete(
              dailyChallenges
            )
            .where(
              eq(
                dailyChallenges.questionId,
                id
              )
            );

          await tx
            .delete(questions)
            .where(
              eq(
                questions.id,
                id
              )
            );
        }
      );

      return reply.send({
        message:
          "Pergunta excluída com sucesso.",

        question: {
          id: existingQuestion.id,
          year: existingQuestion.year,
        },
      });
    }
  );
}