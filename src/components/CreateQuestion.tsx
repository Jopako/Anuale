import type { Question } from "../types/question";

interface CreateQuestionProps {
  question: Question;
}

export const CreateQuestion = ({ question }: CreateQuestionProps) => {
  return (
    <div>
      <h1>Dica: {question.clue}</h1>
    </div>
  );
};