import type { DigitResult } from "../types/digitResult";

export function checkDigits(guess: string, answer: number) {
  const guessDigits = guess.split("");
  const answerDigits = String(answer).split("");

  const remainingAnswer = [...answerDigits]
 
 
 const results: DigitResult[] = guessDigits.map((digit, index) => 
    {

  if (digit === answerDigits[index]) {

    const answerIndex = remainingAnswer.indexOf(digit);

      remainingAnswer.splice(answerIndex, 1);

      return "correct";
  }
  else if (remainingAnswer.includes(digit)) {

      const answerIndex = remainingAnswer.indexOf(digit);

      remainingAnswer.splice(answerIndex, 1);

      return "present";

}

    return "absent";
}
);
return results;
}

