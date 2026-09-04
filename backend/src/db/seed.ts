import "dotenv/config";

import { and, eq  } from "drizzle-orm";

import { db } from "./index.js";

import {
  questions,
  clues,
  dailyChallenges,
} from "./schema.js";

import { challenges } from "./data/challenges.js";

async function seed() {
  try {
    console.log("Iniciando seed...\n");

    for (const challenge of challenges) {
      console.log(
        `Processando ${challenge.year} - ${challenge.date}`
      );

      let question = (
        await db
          .select()
          .from(questions)
          .where(
            eq(
              questions.year,
              challenge.year
            )
          )
          .limit(1)
      )[0];

      if (!question) {
        question = (
          await db
            .insert(questions)
            .values({
              year: challenge.year,
            })
            .returning()
        )[0];

        console.log(
          "  ✓ Pergunta criada"
        );
      } else {
        console.log(
          "  → Pergunta já existe"
        );
      }

     
      for (
        let index = 0;
        index < challenge.clues.length;
        index++
      ) {
        const position = index + 1;
        const text = challenge.clues[index];

        const existingClue = (
          await db
            .select()
            .from(clues)
            .where(
              and(
                eq(
                  clues.questionId,
                  question.id
                ),
                eq(
                  clues.position,
                  position
                )
              )
            )
            .limit(1)
        )[0];

        if (!existingClue) {
          await db.insert(clues).values({
            questionId: question.id,
            position,
            text,
          });

          console.log(
            `  ✓ Dica ${position} criada`
          );
        } else if (
          existingClue.text !== text
        ) {
          await db
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

          console.log(
            `  ↻ Dica ${position} atualizada`
          );
        } else {
          console.log(
            `  → Dica ${position} já está atualizada`
          );
        }
      }

      
      const validPositions =
        challenge.clues.map(
          (_, index) => index + 1
        );

      const existingClues = await db
        .select()
        .from(clues)
        .where(
          eq(
            clues.questionId,
            question.id
          )
        );

      for (const clue of existingClues) {
        if (
          !validPositions.includes(
            clue.position
          )
        ) {
          await db
            .delete(clues)
            .where(
              eq(
                clues.id,
                clue.id
              )
            );

          console.log(
            `  ✕ Dica ${clue.position} removida`
          );
        }
      }

      
      const existingDaily = (
        await db
          .select()
          .from(dailyChallenges)
          .where(
            eq(
              dailyChallenges.date,
              challenge.date
            )
          )
          .limit(1)
      )[0];

      if (!existingDaily) {
        await db
          .insert(dailyChallenges)
          .values({
            date: challenge.date,
            questionId:
              question.id,
          });

        console.log(
          `  ✓ Desafio criado`
        );
      } else if (
        existingDaily.questionId !==
        question.id
      ) {
        await db
          .update(dailyChallenges)
          .set({
            questionId:
              question.id,
          })
          .where(
            eq(
              dailyChallenges.id,
              existingDaily.id
            )
          );

        console.log(
          `  ↻ Desafio atualizado`
        );
      } else {
        console.log(
          `  → Desafio já está correto`
        );
      }

      console.log("");
    }

    console.log(
      "Seed concluído com sucesso!"
    );
  } catch (error) {
    console.error(
      "\nErro ao executar seed:",
      error
    );

    process.exit(1);
  }
}


async function sync() {
  try {
    console.log(
      "🔄 Sincronizando banco com challenges.ts...\n"
    );


    const validDates =
      challenges.map(
        (challenge) => challenge.date
      );

    if (validDates.length > 0) {
      const existingDaily =
        await db
          .select()
          .from(dailyChallenges);

      for (const daily of existingDaily) {
        if (
          !validDates.includes(
            daily.date
          )
        ) {
          await db
            .delete(dailyChallenges)
            .where(
              eq(
                dailyChallenges.id,
                daily.id
              )
            );

          console.log(
            `✕ Desafio removido: ${daily.date}`
          );
        }
      }
    } else {
      await db
        .delete(dailyChallenges);

      console.log(
        "✕ Todos os desafios foram removidos."
      );
    }

    

    await seed();

    const validYears =
      challenges.map(
        (challenge) => challenge.year
      );

    const existingQuestions =
      await db
        .select()
        .from(questions);

    for (
      const question of existingQuestions
    ) {
      if (
        !validYears.includes(
          question.year
        )
      ) {
        await db
          .delete(clues)
          .where(
            eq(
              clues.questionId,
              question.id
            )
          );

        await db
          .delete(dailyChallenges)
          .where(
            eq(
              dailyChallenges.questionId,
              question.id
            )
          );

        await db
          .delete(questions)
          .where(
            eq(
              questions.id,
              question.id
            )
          );

        console.log(
          `✕ Pergunta removida: ${question.year}`
        );
      }
    }

    console.log(
      "\nBanco sincronizado com sucesso!"
    );
  } catch (error) {
    console.error(
      "\nErro ao sincronizar:",
      error
    );

    process.exit(1);
  }
}

const mode = process.argv[2];

if (mode === "sync") {
  sync();
} else {
  seed();
}