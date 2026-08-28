import { Button } from "./components/Button";
import { CreateQuestion } from "./components/CreateQuestion";
import type { Question } from "./types/question";
import React, { useState } from "react";
import { checkGuess } from "./utils/checkGuess";
import { checkDigits } from "./utils/checkDigits";

function App() {
  const [year, setYear] = useState("");

  const question: Question = {
    clue: "Ano que nasceu o criado deste game.",
    year: 2004,
  };

 function handleSubmit(event: React.SubmitEvent) {

  const results = checkDigits(year, question.year);

console.log(results);
  event.preventDefault();

  const result = checkGuess(year,question.year)

  console.log(result);
}

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />

        <button type="submit">Enviar</button>
      </form>
      <p>Ano digitado: {year}</p>

      <h1>Adivinhe o Ano</h1>

      <p>Você consegue descobrir quando isso aconteceu?</p>

      <Button onClick={() => console.log("Começar jogo")}>Jogar</Button>

      <CreateQuestion question={question} />
    </main>
  );
}

export default App;
