import { useEffect, useState } from "react";

import { CreateQuestion } from "./components/CreateQuestion";
import { GuessRow } from "./components/GuessRow";

import { checkDigits } from "./utils/checkDigits";

import type { Guess } from "./types/guess";
import type { Question } from "./types/question";

function App() {
  const [question, setQuestion] =
    useState<Question | null>(null);

  const [digits, setDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const [currentPosition, setCurrentPosition] =
    useState(0);

  const [guesses, setGuesses] = useState<Guess[]>([]);

  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const [currentClue, setCurrentClue] = useState(0);

  const [placeholderText, setPlaceholderText] =
    useState("");

  const [jaDigitou, setJaDigitou] =
    useState(false);


  useEffect(() => {
    if (gameOver || jaDigitou) {
      return;
    }

    const palavras = [
      "1929",
      "1500",
      "2000",
      "1989",
    ];

    let palavraIndex = 0;
    let caractereIndex = 0;
    let apagando = false;

    let timeoutId: number;

    function efeitoDigitacao() {
      const palavraAtual =
        palavras[palavraIndex];

      if (!apagando) {
        setPlaceholderText(
          palavraAtual.substring(
            0,
            caractereIndex + 1
          )
        );

        caractereIndex++;

        if (
          caractereIndex ===
          palavraAtual.length
        ) {
          apagando = true;

          timeoutId = window.setTimeout(
            efeitoDigitacao,
            1200
          );
        } else {
          timeoutId = window.setTimeout(
            efeitoDigitacao,
            180
          );
        }
      } else {
        setPlaceholderText(
          palavraAtual.substring(
            0,
            caractereIndex - 1
          )
        );

        caractereIndex--;

        if (caractereIndex === 0) {
          apagando = false;

          palavraIndex =
            (palavraIndex + 1) %
            palavras.length;

          timeoutId = window.setTimeout(
            efeitoDigitacao,
            500
          );
        } else {
          timeoutId = window.setTimeout(
            efeitoDigitacao,
            50
          );
        }
      }
    }

    timeoutId = window.setTimeout(
      efeitoDigitacao,
      500
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gameOver, jaDigitou]);


  useEffect(() => {
    async function fetchQuestion() {
      try {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const questionId =
          params.get("question");

        const isDevelopment =
          import.meta.env.DEV;

        const url =
          isDevelopment && questionId
            ? `http://localhost:3000/api/${questionId}`
            : "http://localhost:3000/api/daily";

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Erro ao buscar o desafio."
          );
        }

        const data: Question =
          await response.json();

        setQuestion(data);
      } catch (error) {
        console.error(
          "Erro ao buscar pergunta:",
          error
        );
      }
    }

    fetchQuestion();
  }, []);


  function submitGuess() {
    if (gameOver) {
      return;
    }

    if (
      digits.some(
        (digit) => digit === ""
      )
    ) {
      return;
    }

    const ano = digits.join("");

    const result = checkDigits(
      ano,
      currentQuestion.year
    );

    setGuesses((prevGuesses) => [
      ...prevGuesses,
      {
        value: ano,
        results: result,
      },
    ]);

    const acertou = result.every(
      (digit) =>
        digit === "correct"
    );

    if (acertou) {
      setWon(true);
      setGameOver(true);
    } else if (
      currentClue <
      currentQuestion.clues.length - 1
    ) {
      setCurrentClue(
        (prevClue) =>
          prevClue + 1
      );
    } else {
      setGameOver(true);
    }

    setDigits([
      "",
      "",
      "",
      "",
    ]);

    setCurrentPosition(0);
  }


  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (gameOver) {
        return;
      }


      if (/^\d$/.test(event.key)) {
        event.preventDefault();

        setDigits((prevDigits) => {
          const nextDigits = [
            ...prevDigits,
          ];

          nextDigits[
            currentPosition
          ] = event.key;

          return nextDigits;
        });

        setJaDigitou(true);
        setPlaceholderText("");

        if (currentPosition < 3) {
          setCurrentPosition(
            (prevPosition) =>
              prevPosition + 1
          );
        }

        return;
      }


      if (
        event.key === "ArrowLeft"
      ) {
        event.preventDefault();

        setCurrentPosition(
          (prevPosition) =>
            Math.max(
              0,
              prevPosition - 1
            )
        );

        return;
      }


      if (
        event.key === "ArrowRight"
      ) {
        event.preventDefault();

        setCurrentPosition(
          (prevPosition) =>
            Math.min(
              3,
              prevPosition + 1
            )
        );

        return;
      }


      if (
        event.key === "Backspace"
      ) {
        event.preventDefault();

        setDigits((prevDigits) => {
          const nextDigits = [
            ...prevDigits,
          ];

          if (
            nextDigits[
              currentPosition
            ] !== ""
          ) {
            nextDigits[
              currentPosition
            ] = "";

            return nextDigits;
          }

          if (currentPosition > 0) {
            const previousPosition =
              currentPosition - 1;

            nextDigits[
              previousPosition
            ] = "";

            setCurrentPosition(
              previousPosition
            );
          }

          return nextDigits;
        });

        return;
      }


      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        submitGuess();

        return;
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    currentPosition,
    gameOver,
    digits,
  ]);


  if (!question) {
    return <p>Carregando...</p>;
  }

  const currentQuestion =
    question;


  return (
    <main>
      <header className="header">
        <h1>ANUALE</h1>

        <p>
          Descubra em que ano isso
          aconteceu.
        </p>
      </header>

      <CreateQuestion
        clue={
          currentQuestion.clues[
            currentClue
          ]
        }
        clueNumber={
          currentClue + 1
        }
        totalClues={
          currentQuestion.clues.length
        }
      />

      <div className="game-board">


        {guesses.map(
          (guess, index) => (
            <GuessRow
              key={index}
              guess={guess.value}
              results={guess.results}
            />
          )
        )}


        {!gameOver && (
          <div className="guess-row input-row">
            {Array.from(
              { length: 4 },
              (_, index) => {
                const digit =
                  digits[index];

                const placeholderDigit =
                  placeholderText[
                    index
                  ];

                const isSelected =
                  index ===
                  currentPosition;

                return (
                  <div
                    key={index}
                    className={`input-digit ${
                      digit
                        ? "filled"
                        : placeholderDigit
                          ? "placeholder-digit"
                          : ""
                    } ${
                      isSelected
                        ? "selected-digit"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPosition(
                        index
                      )
                    }
                  >
                    {digit ||
                      placeholderDigit ||
                      ""}
                  </div>
                );
              }
            )}
          </div>
        )}


        {Array.from(
          {
            length: Math.max(
              0,
              currentQuestion
                .clues.length -
                guesses.length -
                (gameOver
                  ? 0
                  : 1)
            ),
          },
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="guess-row"
            >
              {Array.from(
                { length: 4 },
                (_, digitIndex) => (
                  <div
                    key={digitIndex}
                    className="empty-digit"
                  />
                )
              )}
            </div>
          )
        )}
      </div>


      {gameOver && (
        <div className="game-result">
          {won ? (
            <h2>
              Você acertou!
            </h2>
          ) : (
            <h2>
              Fim de jogo
            </h2>
          )}

          <p>
            A resposta era{" "}
            <strong>
              {
                currentQuestion.year
              }
            </strong>
          </p>
        </div>
      )}
    </main>
  );
}

export default App;