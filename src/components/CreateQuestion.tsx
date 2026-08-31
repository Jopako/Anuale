interface CreateQuestionProps {
  clue: string;
}

export const CreateQuestion = ({ clue }: CreateQuestionProps) => {
  return (
    <div className="question">
      <h2>{clue}</h2>
    </div>
  );
};