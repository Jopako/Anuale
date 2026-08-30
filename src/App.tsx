import { useState } from "react";

import { Button } from "./components/Button";
import { CreateQuestion } from "./components/CreateQuestion";
import { GuessRow } from "./components/GuessRow";

import { checkDigits } from "./utils/checkDigits";

import type { Question } from "./types/question";
import type { Guess } from "./types/guess";



function App() {
  const question: Question = {
    clue: "A COVID-19 foi classificada como pandemia pela OMS.",
    year: 2020,
  };

  const [ano, setAno] = useState("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    if (ano === "") {
      return;
    }

    if (gameOver) {
      return;
    }

    const result = checkDigits(ano, question.year);

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
    } else if (guesses.length === 5) {
      setGameOver(true);
    }

    setAno("");
  }

  return (
    <main>
      <h1>Adivinhe o Ano</h1>

      <p>Descubra em que ano isso aconteceu.</p>

      <CreateQuestion question={question} />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={ano}
          maxLength={4}
          disabled={gameOver}
          placeholder=""
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

          <p>A resposta era {question.year}</p>
        </div>
      )}
    </main>
  );
}

export default App;