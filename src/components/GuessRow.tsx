import type { DigitResult } from "../types/digitResult";

interface GuessRowProps {
  guess: string;
  results: DigitResult[];
}

export function GuessRow({
  guess,
  results,
}: GuessRowProps) {
  return (
    <div className="guess-row">
      {Array.from({ length: 4 }, (_, index) => {
        const digit = guess[index] ?? "";
        const result = results[index] ?? "absent";

        return (
          <div
            key={index}
            className="digit-wrapper"
            style={
              {
                "--delay": `${index * 300}ms`,
              } as React.CSSProperties
            }
          >
            <div className="digit-flip">
              <div className="digit-face digit-front">
                {digit}
              </div>

              <div
                className={`digit-face digit-back ${result}`}
              >
                {digit}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}                                                               