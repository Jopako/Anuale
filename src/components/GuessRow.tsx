import type { DigitResult } from "../types/digitResult";

interface GuessRowProps {
  guess: string;
  results: DigitResult[];
}

export function GuessRow({ guess, results }: GuessRowProps) {
  function getBackgroundColor(result: DigitResult) {
    if (result === "correct") {
      return "#538d4e";
    }

    if (result === "present") {
      return "#b59f3b";
    }

    return "#3a3a3c";
  }

  return (
    <div className="guess-row">
      {guess.split("").map((digit, index) => (
        <div
          className="digit"
          key={index}
          style={{
            backgroundColor: getBackgroundColor(results[index]),
          }}
        >
          {digit}
        </div>
      ))}
    </div>
  );
}