import { useEffect, useRef, useState } from "react";

import { CreateQuestion } from "./components/CreateQuestion";
import { GuessRow } from "./components/GuessRow";

import { checkDigits } from "./utils/checkDigits";

import type { Guess } from "./types/guess";
import type { Question } from "./types/question";

function App() {
  const [question, setQuestion] = useState<Question | null>(null);

  const [ano, setAno] = useState("");
  const [guesses, setGuesses] = useState<Guess[]>([]);

  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const [currentClue, setCurrentClue] = useState(0);

  const [placeholderText, setPlaceholderText] = useState("");
  const [jaDigitou, setJaDigitou] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameOver || jaDigitou) {
      return;
    }

    const palavras = ["1929", "1500", "2000", "1989"];

    let palavraIndex = 0;
    let caractereIndex = 0;
    let apagando = false;

    let timeoutId: number;

    function efeitoDigitacao() {
      const palavraAtual = palavras[palavraIndex];

      if (!apagando) {
        setPlaceholderText(palavraAtual.substring(0, caractereIndex + 1));

        caractereIndex++;

        if (caractereIndex === palavraAtual.length) {
          apagando = true;

          timeoutId = window.setTimeout(efeitoDigitacao, 1200);
        } else {
          timeoutId = window.setTimeout(efeitoDigitacao, 180);
        }
      } else {
        setPlaceholderText(palavraAtual.substring(0, caractereIndex - 1));

        caractereIndex--;

        if (caractereIndex === 0) {
          apagando = false;

          palavraIndex = (palavraIndex + 1) % palavras.length;

          timeoutId = window.setTimeout(efeitoDigitacao, 500);
        } else {
          timeoutId = window.setTimeout(efeitoDigitacao, 50);
        }
      }
    }

    timeoutId = window.setTimeout(efeitoDigitacao, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gameOver, jaDigitou]);

  useEffect(() => {
    async function fetchDailyQuestion() {
      try {
        const response = await fetch("http://localhost:3000/api/daily");

        if (!response.ok) {
          throw new Error("Erro ao buscar o desafio do dia.");
        }

        const data: Question = await response.json();

        setQuestion(data);
      } catch (error) {
        console.error("Erro ao buscar pergunta:", error);
      }
    }

    fetchDailyQuestion();
  }, []);

  useEffect(() => {
    if (!gameOver) {
      inputRef.current?.focus();
    }
  }, [gameOver, guesses]);

  if (!question) {
    return <p>Carregando...</p>;
  }

  const currentQuestion = question;

  function submitGuess() {
    if (ano === "" || gameOver) {
      return;
    }

    const result = checkDigits(ano, currentQuestion.year);

    setGuesses((prevGuesses) => [
      ...prevGuesses,
      {
        value: ano,
        results: result,
      },
    ]);

    const acertou = result.every((digit) => digit === "correct");

    if (acertou) {
      setWon(true);
      setGameOver(true);
    } else if (currentClue < currentQuestion.clues.length - 1) {
      setCurrentClue((prevClue) => prevClue + 1);
    } else {
      setGameOver(true);
    }

    setAno("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      submitGuess();
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (/^\d*$/.test(value)) {
      setAno(value);

      if (value.length > 0) {
        setJaDigitou(true);
        setPlaceholderText("");
      }
    }
  }

  return (
    <main>
      <header className="header">
        <h1>ANUALE</h1>

        <p>Descubra em que ano isso aconteceu.</p>
      </header>

      <CreateQuestion
        clue={currentQuestion.clues[currentClue]}
        clueNumber={currentClue + 1}
        totalClues={currentQuestion.clues.length}
      />

      <div className="game-board">
        {guesses.map((guess, index) => (
          <GuessRow key={index} guess={guess.value} results={guess.results} />
        ))}

        {!gameOver && (
          <div
            className="guess-row input-row"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: 4 }, (_, index) => {
              const digit = ano[index];
              const placeholderDigit = placeholderText[index];

              return (
                <div
                  key={index}
                  className={`input-digit ${
                    digit
                      ? "filled"
                      : placeholderDigit
                        ? "placeholder-digit"
                        : ""
                  }`}
                >
                  {digit ?? placeholderDigit ?? ""}
                </div>
              );
            })}
          </div>
        )}

        {Array.from(
          {
            length: Math.max(
              0,
              currentQuestion.clues.length -
                guesses.length -
                (gameOver ? 0 : 1),
            ),
          },
          (_, index) => (
            <div key={`empty-${index}`} className="guess-row">
              {Array.from({ length: 4 }, (_, digitIndex) => (
                <div key={digitIndex} className="empty-digit" />
              ))}
            </div>
          ),
        )}
      </div>

      <input
        ref={inputRef}
        className="hidden-input"
        type="text"
        value={ano}
        maxLength={4}
        disabled={gameOver}
        autoComplete="off"
        inputMode="numeric"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      {gameOver && (
        <div className="game-result">
          {won ? <h2>Você acertou!</h2> : <h2>Fim de jogo</h2>}

          <p>
            A resposta era <strong>{currentQuestion.year}</strong>
          </p>
        </div>
      )}
    </main>
  );
}

export default App;
