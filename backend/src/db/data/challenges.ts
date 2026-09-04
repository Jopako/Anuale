export interface ChallengeData {
  year: string;
  date: string;
  clues: string[];
}

export const challenges: ChallengeData[] = [

  {
    year: "1919",
    date: "2026-09-04",
    clues: [
      'Aconteceu o bizarro "Grande Dilúvio de Melaço": um tanque industrial gigante estourou em Boston, criando um tsunami de xarope doce e pegajoso que destruiu prédios a 50 km/h.',
      "Um eclipse solar observado na pequena cidade de Sobral, no interior do Ceará, ajudou os cientistas a comprovarem a complexa Teoria da Relatividade de Albert Einstein.",
      "Foi assinado o Tratado de Versalhes, o acordo de paz que oficializou o fim da Primeira Guerra Mundial.",
      "A Liga das Nações, antecessora da ONU, foi fundada.",
    ],
  },
    {
    year: "2008",
    date: "2026-09-05",
    clues: [
     'Ronaldo Fenômeno tem sua tão comentada "saidinha" com os travestis.',
     "Gretchen se candidatou a prefeita da Ilha de Itamaracá, em Pernambuco.",
     "O primeiro episódio de Breaking Bad é lançado.",
     "Lança GTA IV.",
    ],
  },
];