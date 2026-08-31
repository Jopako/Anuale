import { useEffect, useState } from "react";

import { Button } from "./components/Button";
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

  useEffect(() => {
    async function fetchDailyQuestion() {
      const response = await fetch(
        "http://localhost:3000/api/daily"
      );

      const data: Question = await response.json();

      setQuestion(data);
    }

    fetchDailyQuestion();
  }, []);

  if (!question) {
    return <p>Carregando...</p>;
  }

  const currentQuestion = question;

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    if (ano === "") {
      return;
    }

    if (gameOver) {
      return;
    }

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
      (digit) => digit === "correct"
    );

    if (acertou) {
      setWon(true);
      setGameOver(true);
    } else if (
      currentClue < currentQuestion.clues.length - 1
    ) {
      setCurrentClue((prevClue) => prevClue + 1);
    } else {
      setGameOver(true);
    }

    setAno("");
  }

  return (
    <main>
      <h1>Adivinhe o Ano</h1>

      <p>Descubra em que ano isso aconteceu.</p>

      <CreateQuestion
        clue={currentQuestion.clues[currentClue]}
      />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={ano}
          maxLength={4}
          disabled={gameOver}
          placeholder="YYYY"
          onChange={(event) => {
            const value = event.target.value;

            if (/^\d*$/.test(value)) {
              setAno(value);
            }
          }}
        />

        <Button disabled={gameOver}>
          Enviar
        </Button>
      </form>

      <div className="guesses">
        {guesses.map((guess, index) => (
          <GuessRow
            key={index}
            guess={guess.value}
            results={guess.results}
          />
        ))}
      </div>

      {gameOver && (
        <div className="game-result">
          {won ? (
            <h2>Você acertou!</h2>
          ) : (
            <h2>Você perdeu!</h2>
          )}

          <p>
            A resposta era {currentQuestion.year}
          </p>
        </div>
      )}
    </main>
  );
}

export default App;