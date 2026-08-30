import type { DigitResult } from "../types/digitResult";

export function checkDigits(guess: string, answer: number) {

  const guessDigits = guess.split("");
  const answerDigits = String(answer).split("");

  const remainingAnswer = [...answerDigits];

  const results: DigitResult[] = guessDigits.map((digit, index) => {

    if (digit === answerDigits[index]) {

      const answerIndex = remainingAnswer.indexOf(digit);

      remainingAnswer.splice(answerIndex, 1);

      return "correct";
    }

    return "absent";
  });

  guessDigits.forEach((digit, index) => {

    if (results[index] === "correct") {
      return;
    }

    const answerIndex = remainingAnswer.indexOf(digit);

    if (answerIndex !== -1) {
      results[index] = "present";

      remainingAnswer.splice(answerIndex, 1);
    }
  });

  return results;
}