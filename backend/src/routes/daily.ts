import type { FastifyInstance } from "fastify";

export async function dailyRoutes(app: FastifyInstance) {
  app.get("/api/daily", async () => {
    return {
      id: 1,
      year: 2020,
      clues: [
        "Este acontecimento mudou profundamente a rotina de bilhões de pessoas ao redor do mundo.",
        "O acontecimento foi provocado por um novo coronavírus identificado no final de 2019.",
        "Em março, a Organização Mundial da Saúde fez uma declaração importante sobre este acontecimento.",
        "A COVID-19 foi classificada como pandemia pela OMS.",
      ],
    };
  });
}