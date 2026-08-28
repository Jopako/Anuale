import type { DigitResult } from "../types/digitResult";

export function checkDigits(guess: string, answer: number) {
  const guessDigits = guess.split("");
  const answerDigits = String(answer).split("");
 
 
 const results: DigitResult[] = guessDigits.map((digit, index) => 
    {

  if (digit === answerDigits[index]) {
    return "correct";
  }

  return "absent";
});
return results;
}

