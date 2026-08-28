export function checkGuess(guess: string, answer: number) {
  const guessNumber = Number(guess);

 return guessNumber === answer ? true : false;
}
