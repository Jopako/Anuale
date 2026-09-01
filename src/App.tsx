import { useEffect, useRef, useState } from "react";

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

  const [jaDigitou, setJaDigitou] = useState(false);

  const [mobileInput, setMobileInput] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);

  // ========================================
  // PLACEHOLDER ANIMADO
  // ========================================

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

  // ========================================
  // BUSCAR PERGUNTA
  // ========================================

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

        const apiUrl =
          import.meta.env.VITE_API_URL;

        if (!apiUrl) {
          throw new Error(
            "VITE_API_URL não foi definida."
          );
        }

        const url =
          isDevelopment && questionId
            ? `${apiUrl}/api/${questionId}`
            : `${apiUrl}/api/daily`;

        console.log(
          "Buscando pergunta em:",
          url
        );

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar o desafio. Status: ${response.status}`
          );
        }

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "A API não retornou JSON."
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

  // ========================================
  // ENVIAR PALPITE
  // ========================================

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
    setMobileInput("");
  }

  // ========================================
  // INPUT DO CELULAR
  // ========================================

  function handleMobileInput(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value =
      event.target.value;

    const digit =
      value.slice(-1);

    if (!/^\d$/.test(digit)) {
      setMobileInput("");
      return;
    }

    setDigits((prevDigits) => {
      const nextDigits = [
        ...prevDigits,
      ];

      nextDigits[
        currentPosition
      ] = digit;

      return nextDigits;
    });

    setJaDigitou(true);
    setPlaceholderText("");
    setMobileInput("");

    if (currentPosition < 3) {
      setCurrentPosition(
        (prevPosition) =>
          prevPosition + 1
      );
    }
  }

  // ========================================
  // TECLADO DO CELULAR
  // ========================================

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (gameOver) {
      return;
    }

    // Enter / ação de enviar
    if (event.key === "Enter") {
      event.preventDefault();

      submitGuess();

      return;
    }

    // Backspace
    if (event.key === "Backspace") {
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

      setMobileInput("");

      return;
    }

    // Seta esquerda
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

    // Seta direita
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
    }
  }

  // ========================================
  // TECLADO FÍSICO
  // ========================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (gameOver) {
        return;
      }

      // Quando o input invisível estiver focado,
      // ele próprio controla o teclado.
      if (
        event.target instanceof
        HTMLInputElement
      ) {
        return;
      }

      // Números
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

      // Seta esquerda
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

      // Seta direita
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

      // Backspace
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

      // Enter
      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        submitGuess();
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

  // ========================================
  // LOADING
  // ========================================

  if (!question) {
    return <p>Carregando...</p>;
  }

  const currentQuestion =
    question;

  // ========================================
  // RENDER
  // ========================================

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
        {/* PALPITES */}

        {guesses.map(
          (guess, index) => (
            <GuessRow
              key={index}
              guess={guess.value}
              results={guess.results}
            />
          )
        )}

        {/* INPUT ATUAL */}

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
                    onClick={() => {
                      setCurrentPosition(
                        index
                      );

                      inputRef.current?.focus();
                    }}
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

        {/* CASAS VAZIAS */}

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

      {/* INPUT INVISÍVEL PARA O CELULAR */}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitGuess();
        }}
      >
        <input
          ref={inputRef}
          className="hidden-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="enter"
          autoComplete="off"
          value={mobileInput}
          onChange={
            handleMobileInput
          }
          onKeyDown={
            handleInputKeyDown
          }
          disabled={gameOver}
        />
      </form>

      {/* RESULTADO */}

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