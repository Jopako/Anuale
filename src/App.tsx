import { useEffect, useRef, useState } from "react";
import "./game.css";

import AdminDashboard from "./admin/AdminDashboard";
import Admin from "./admin/Admin";

import { CreateQuestion } from "./components/CreateQuestion";
import { GuessRow } from "./components/GuessRow";

import { checkDigits } from "./utils/checkDigits";

import type { Guess } from "./types/guess";
import type { Question } from "./types/question";

function Game() {
  const [question, setQuestion] =
    useState<Question | null>(null);

  const [idle, setIdle] = useState(false);

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

  const [highestUnlockedClue, setHighestUnlockedClue] =
    useState(0);

  const [placeholderText, setPlaceholderText] =
    useState("");

  const [jaDigitou, setJaDigitou] = useState(false);

  const [mobileInput, setMobileInput] =
    useState("");

  const [showAbout, setShowAbout] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameOver || jaDigitou || idle) {
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
  }, [gameOver, jaDigitou, idle]);

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

        const response =
          await fetch(url);

        if (response.status === 404) {
          const errorData = await response.json();

          if (
            errorData.error ===
            "Nenhum desafio encontrado para hoje."
          ) {
            setIdle(true);
            return;
          }
        }

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

    const currentQuestion =
      question;

    if (!currentQuestion) {
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
      highestUnlockedClue <
      currentQuestion.clues.length - 1
    ) {
      const nextClue =
        highestUnlockedClue + 1;

      setHighestUnlockedClue(
        nextClue
      );

      setCurrentClue(
        nextClue
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

  function goBackClue() {
    setCurrentClue(
      (prevClue) =>
        Math.max(
          0,
          prevClue - 1
        )
    );
  }

  function goForwardClue() {
    setCurrentClue(
      (prevClue) =>
        Math.min(
          highestUnlockedClue,
          prevClue + 1
        )
    );
  }

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

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (gameOver || idle) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      submitGuess();

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

      setMobileInput("");

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
    }
  }

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (gameOver || idle) {
        return;
      }

      if (
        event.target instanceof
        HTMLInputElement
      ) {
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
    idle,
  ]);

  if (idle) {
    return (
      <div className="idle-screen">
        <div className="idle-container">
          <div className="idle-logo">
            ANUALE
          </div>

          <div className="idle-icon">
            🌙
          </div>

          <h1>
            Nenhum desafio hoje
          </h1>

          <p>
            O ANUALE está em pausa por
            enquanto.
            <br />
            Volte amanhã para um novo
            desafio.
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-logo">
            ANUALE
          </div>

          <div className="loading-status">
            <span className="loading-dot"></span>

            <span>
              INICIALIZANDO SERVIDORES
            </span>
          </div>

          <div className="loading-bar">
            <div className="loading-bar-progress"></div>
          </div>

          <p className="loading-message">
            Conectando ao sistema...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion =
    question;

  const canGoBack =
    currentClue > 0;

  const canGoForward =
    currentClue <
    highestUnlockedClue;

  const showClueNavigation =
    guesses.length > 0;

  return (
    <main>
      <button
        type="button"
        className="floating-logo-button"
        onClick={() =>
          setShowAbout(true)
        }
        aria-label="Sobre o autor"
      >
        <img
          className="floating-logo"
          src="/anuale-logo.png"
          alt=""
        />
      </button>

      <header className="header">
        <h1>ANUALE</h1>

        <p>
          Descubra em que ano isso
          aconteceu.
        </p>
      </header>

      {showClueNavigation && (
        <div className="clue-navigation">
          <button
            type="button"
            className="clue-navigation-button"
            onClick={goBackClue}
            disabled={!canGoBack}
            aria-label="Voltar para a dica anterior"
          >
            ←
          </button>

          <button
            type="button"
            className="clue-navigation-button"
            onClick={goForwardClue}
            disabled={!canGoForward}
            aria-label="Avançar para a próxima dica"
          >
            →
          </button>
        </div>
      )}

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

        {Array.from(
          {
            length: Math.max(
              0,
              currentQuestion.clues.length -
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

      {showAbout && (
        <div
          className="about-overlay"
          onClick={() =>
            setShowAbout(false)
          }
        >
          <div
            className="about-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="about-close"
              onClick={() =>
                setShowAbout(false)
              }
              aria-label="Fechar"
            >
              ×
            </button>

            <div className="about-logo">
              <img
                src="/anuale-logo.png"
                alt="ANUALE"
              />
            </div>

            <h2>
              Oi, eu sou o João Paulo 👋
            </h2>

            <p>
              Eu sou o criador do ANUALE.
            </p>

            <p>
              Criei este projeto para colocar
              em prática minhas ideias de
              desenvolvimento web e construir
              uma experiência simples, divertida
              e diferente.
            </p>

            <a
              href="https://github.com/Jopako"
              target="_blank"
              rel="noreferrer"
              className="about-github"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

function App() {
  const path =
    window.location.pathname;

  if (
    path === "/anuale-admin" ||
    path === "/anuale-admin/"
  ) {
    return <Admin />;
  }

  if (
    path ===
    "/anuale-admin/dashboard"
  ) {
    return <AdminDashboard />;
  }

  return <Game />;
}

export default App;