interface CreateQuestionProps {
  clue: string;
  clueNumber: number;
  totalClues: number;
}

export const CreateQuestion = ({
  clue,
  clueNumber,
  totalClues,
}: CreateQuestionProps) => {
  return (
    <section className="question">
      <div className="question-header">
        <span>Dica</span>

        <span>
          {clueNumber.toString().padStart(2, "0")} /{" "}
          {totalClues.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="question-card">
        <h2>{clue}</h2>
      </div>
    </section>
  );
};